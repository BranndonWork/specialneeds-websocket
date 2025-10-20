const axios = require('axios');
const Token = require('./jwt.js');
const path = require('path');
const fs = require('fs');
const logger = require('./logger.js');
const config = require('./config.js');

class API {
    // get verbose from environment variable

    constructor(websocket) {
        this.api = axios.create({
            baseURL: config.apiSchemaDomainAndPort,
            timeout: 10000, // 10 seconds
        });
        this.VERBOSE = process.env.VERBOSE ? 1 : 0;
        this.websocket = websocket;
        this.token = null;
        this.apiPrefix = "api/v1/";
        this.rateLimitRequestsPerSecond = .001;

        setInterval(() => {
            const dir = 'rate_limits';
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const filePath = path.join(dir, file);
                try {
                    const data = JSON.parse(fs.readFileSync(filePath));
                    if (Date.now() - data.timestamp > 60000) {
                        fs.unlinkSync(filePath);
                    }
                } catch (err) {
                    console.error(`Error while processing file ${filePath}: ${err}`);
                }
            }
        }, 60000);

    }

    async rateLimitRequests() {
        // disable rate limiting for now
        return true;
        logger("Checking rate limit");
        let key = this?.token?.access || null;
        if (!key) {
            // use the this.websocket ip address
            key = this.websocket.request.connection.remoteAddress || null;
        }
        if (!key) {
            logger("No key found", { token: this.token, remoteAddress: this.websocket.request.connection.remoteAddress });
            return false;
        }
        const dir = 'rate_limits';
        const file = path.join(dir, `${key}.json`);
        try {
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir);
            }
            if (fs.existsSync(file)) {
                const data = JSON.parse(fs.readFileSync(file));
                const seconds_elapsed = Math.round((Date.now() - data.timestamp) / 1000);
                const average_per_second = data.count / seconds_elapsed;
                logger("Rate limit check", {
                    key,
                    seconds_elapsed,
                    average_per_second,
                    count: data.count,
                    max: this.rateLimitRequestsPerSecond,
                    timestamp: data.timestamp,
                    now: Date.now(),
                });
                if (average_per_second > this.rateLimitRequestsPerSecond) {
                    logger("Rate limit exceeded");
                    return false;
                }
                data.count++;
                data.timestamp = Date.now();
                fs.writeFileSync(file, JSON.stringify(data));
            } else {
                fs.writeFileSync(file, JSON.stringify({ count: 1, timestamp: Date.now() }));
            }
            logger("Rate limit not exceeded", {
                key,
                token: this.token,
                remoteAddress: this.websocket.request.connection.remoteAddress
            });
            return true;
        } catch (err) {
            console.error(`Error while processing file ${file}: ${err}`);
            return false;
        }
    }

    /**
     * Adds the JWT token to the request headers if it exists.
     * @returns {void}
     * @private
     * @memberof API
     * @method addTokenToHeaders
     * @instance
     * @example
     * this.addTokenToHeaders();
     */
    addTokenToHeaders() {
        if (this.token) {
            this.api.defaults.headers.common['Authorization'] = `Bearer ${this.token.access}`.trim();
        }
    }


    async request(method, path, data) {
        if (await this.rateLimitRequests() === false) {
            return {
                "status": 429,
                "error": `Unable to complete ${method} request`, "detail": "Rate limit exceeded"
            };
        }
        path = path.replace(/^\/+|\/+$/g, '') + '/';
        try {
            logger(`${method}: `, { path, data });
            this.addTokenToHeaders();
            let response;
            if (method === 'post') {
                response = await this.api.post(path, data);
            } else if (method === 'put') {
                response = await this.api.put(path, data);
            } else if (method === 'get') {
                response = await this.api.get(path, { params: data });
            } else if (method === 'delete') {
                response = await this.api.delete(path, { params: data });
            } else {
                return {
                    "status": 500, "data": {
                        "error": `Unable to complete ${method} request`, "detail": "Invalid method"
                    }
                };
            }
            return response.data;
        } catch (e) {
            let status = e.response?.status || 500;
            let data = e.response?.data || { "error": `Unable to complete ${method} request`, "detail": e };
            logger(`${method} error`, e);
            return { "status": status, "data": data };
        }
    }


    /**
     * Updates the JWT token to the provided value if it is different from the current value.
     * @param {object} data - The data containing the token to update.
     * @returns {void}
     */
    async updateToken(data) {
        try {
            let { token } = data;
            delete data.token;
            if (!token) return;
            if (typeof token == "string") {
                try {
                    token = JSON.parse(token);
                } catch (e) {
                    logger("Failed to parse token", e);
                    return;
                }
            }

            if (this.token && this.token == token) return;

            // if the token is an object, try to refresh it if needed
            if (token.access && token.refresh) {
                token = await this.refreshToken(token);
            } else {
                logger("Invalid token", { token });
            }

            // if the token is still an object, set it
            if (!this.token || this.token != token) {
                this.token = token;
            }
        } catch (e) {
            logger("Failed to update token", e);
        }
        return
    }

    /**
     * Runs the specified WebSocket action with the given data.
     * @param {string} action - The name of the action to run.
     * @param {object} data - The data to pass to the action.
     * @returns {Promise<object>} - The response data from the action.
     */
    async runAction(action, data) {
        await this.updateToken(data);
        return await this.request('post', '/websocket/', { action, data });
    }

    /**
     * Sends a POST request to the specified endpoint with the given data and token.
     * @param {string} endpoint - The endpoint to send the request to.
     * @param {object} data - The data to include in the request body.
     * @returns {Promise<object>} - The response data from the endpoint.
     */
    async queryAPI(endpoint, data) {
        await this.updateToken(data);
        // if method is part of data, get the method and delete it
        let method = data.method;
        delete data.method;
        if (!method) method = 'get';
        method = method.toLowerCase();
        // trim the begining slash from the endpoint
        endpoint = endpoint.replace(/^\/+/, '');
        // add the api prefix to the endpoint
        endpoint = this.apiPrefix + endpoint;
        // if the method exists
        return await this.request(method, endpoint, data);
    }

    /**
    Refreshes the JWT token if it needs to be refreshed and returns the refreshed token.
    @param {object} token - The token object to be refreshed.
    @returns {Promise<object>} - The refreshed token object.
    */
    async refreshToken(token) {
        const before = JSON.stringify(token);
        let jwt = new Token(token);
        const refreshed = await jwt.refreshTokenIfNeeded()
        if (before != JSON.stringify(refreshed) && this.websocket) {
            this.websocket.emit('setClientCookie', 'token', { ...refreshed });
        }
        return refreshed;
    }

}

module.exports = API;
