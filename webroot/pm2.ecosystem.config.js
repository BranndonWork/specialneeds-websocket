// pm2 ecosystem file for websocket server
// contains environment variables for local, staging, and production 
// also contains pm2 configuration for websocket server

module.exports = {
    apps: [
        {
            name: "websocket",
            script: "./server.js",
            listen_timeout: 5000,
            autorestart: true,
            max_memory_restart: "800M",
            watch: process.env.NODE_ENV === 'development',
            ignore_watch: ["node_modules", "logs", "public", "uploads", "rate_limit"],
            env: {
                NODE_ENV: "development",
                API_URL: "http://local.api.specialneeds.com:8000/",
                VERBOSE: 1,
                PORT: 8080,
            },
            env_production: {
                NODE_ENV: "production",
                API_URL: "http://api.specialneeds.com:8000/",
                VERBOSE: 0,
                PORT: 8080,
            },
        },
    ],
};
