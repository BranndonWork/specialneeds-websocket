const config = {
    env: process.env.NODE_ENV || 'development',
    apiSchemaDomainAndPort: process.env.API_URL || 'http://localhost:8000/',
    verbose: process.env.VERBOSE ? 1 : 0,
    port: process.env.PORT || 8080,
}
module.exports = config