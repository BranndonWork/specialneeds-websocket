const API = require('./api.js');
const logger = require('./logger.js');
const express = require('express');
const app = express();
const http = require('http');
const config = require('./config.js');
const port = config.port;

const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: { origin: '*' },
    path: '/socket/socket.io',
    engine: { wsEngine: "ws", pingInterval: 10000, pingTimeout: 5000 },
});

const userAPIs = {};
const getUserApi = (ws) => {
    let websocketId = ws.id;
    if (!userAPIs[websocketId]) {
        userAPIs[websocketId] = new API(ws);
    }
    return userAPIs[websocketId];
}

// Handling the action received from client
const handleAction = async (api, action, data) => {
    return await api.runAction(action, data)
}

const handleQueryAPI = async (api, endpoint, data) => {
    const response = await api.queryAPI(endpoint, data)
    logger('handleQueryAPI response:', response);
    return response;
}

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

const nsp = io.of('/socket');

nsp.on("connection", (socket) => {
    const api = getUserApi(socket);
    logger(socket.id, 'user connected');
    socket.emit('message', 'Welcome to the server! ' + socket.id);

    socket.on('message', (message, callback) => {
        logger(socket.id, 'Message received:', message);
        if (callback && typeof callback === 'function') {
            callback(message);
        }
    });

    socket.on('loaded', (message, callback) => {
        logger(socket.id, 'Loaded:', message);
        callback(message + ' received!');
        // client.emit('loadedResponse', 'Request received!');
    });

    socket.on('runAction', async (action, data, callback) => {
        logger(socket.id, 'runAction:', action, data)
        const response = await handleAction(api, action, data);
        logger(socket.id, 'runAction response:', response);
        if (callback && typeof callback === 'function') {
            if (response && response.status && response.status === 500) {
                callback(response.error, null);
            } else {
                callback(null, response);
            }
        }
    });

    socket.on('queryAPI', async (endpoint, data, callback) => {
        logger(socket.id, 'queryAPI:', endpoint, data);
        const response = await handleQueryAPI(api, endpoint, data);
        logger(socket.id, 'queryAPI response:', response);
        if (callback && typeof callback === 'function') {
            if (response && response.status && response.status === 500) {
                callback(response.error, response);
            } else {
                callback(null, response);
            }
        }
    });

    socket.on('disconnect', () => {
        logger(socket.id, 'user disconnected');
    });

    socket.on('error', (error) => {
        logger(socket.id, 'error:', error);
    });

    socket.on('connect_error', (error) => {
        logger(socket.id, 'connect_error:', error);
    });


});

nsp.on('error', (error) => {
    logger('io error:', error);
});

nsp.on('connect_error', (error) => {
    logger('io connect_error:', error);
});

nsp.on('connect_timeout', (error) => {
    logger('io connect_timeout:', error);
});

nsp.on('reconnect', (error) => {
    logger('io reconnect:', error);
});

nsp.on('reconnect_attempt', (error) => {
    logger('io reconnect_attempt:', error);
});

nsp.on('reconnecting', (error) => {
    logger('io reconnecting:', error);
});

nsp.on('reconnect_error', (error) => {
    logger('io reconnect_error:', error);
});

nsp.on('reconnect_failed', (error) => {
    logger('io reconnect_failed:', error);
});

nsp.on('ping', (error) => {
    logger('io ping:', error);
});



server.listen(port, () => { logger(`${config.env} websocket listening on *:${port}`); });


