const axios = require('axios');
const logger = require('./logger.js');
const config = require('./config.js');

class Token {
    constructor(token) {
        this.token = token;
        this.access = token.access;
        this.refresh = token.refresh;
    }

    async getNewToken() {
        try {
            if (!this.refresh) {
                logger("No refresh token found")
                return null;
            }
            logger("refreshing token", this.token)
            const body = JSON.stringify({ 'refresh': this.refresh })
            const headers = { 'Content-Type': 'application/json' }
            const res = await axios.post(`${config.apiSchemaDomainAndPort}/api/v1/token/refresh/`, body, { headers: headers });
            const refreshedToken = res.data;
            logger("refreshed token", refreshedToken)
            if (refreshedToken.access) {
                return { refresh: this.refresh, access: refreshedToken.access };
            }
        } catch (e) {
            logger("Could not refresh token", e)
            return null;
        }
    }

    async refreshTokenIfNeeded() {
        if (this.tokenExpired()) {
            return await this.getNewToken();
        }
        return this.token;
    }

    tokenExpired() {
        const jwt = this.parseJwt({ ...this.token });
        if (!jwt || !jwt.access || !jwt.access.exp) return true;
        const exp = jwt.access.exp;
        let currentTimestamp = Math.round(new Date().getTime() / 1000);
        let expiredOffset = 3;
        let expired = (currentTimestamp - (exp - expiredOffset)) > 0;
        return expired;
    }

    parseJwt(token) {
        try {
            let parsed = token;
            for (let key in parsed) {
                // logger("JWT key", { key, value: parsed[key], type: typeof parsed[key] })
                // if there are two periods, it's a JWT
                if (typeof parsed[key] === "string" && parsed[key].split('.').length === 3) {
                    let val = parsed[key].split('.')[1].split('.')[0];
                    let atobVal = atob(val);
                    parsed[key] = JSON.parse(atobVal);
                }
            }
            return parsed;
        } catch (e) {
            console.error(e);
            return null;
        }
    }

}

module.exports = Token;