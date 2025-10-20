const config = require('./config');

function logger(...args) {
    if (config.verbose) {
        console.log(...args);
    }
}

module.exports = logger;
