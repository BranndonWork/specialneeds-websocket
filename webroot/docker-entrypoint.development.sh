#!/bin/bash

cd /code

export NODE_ENV="development"
export API_URL="http://local.api.specialneeds.com:8000/"
export VERBOSE=1
export PORT=8080

# Run the server.js script with node
node ./server.js
