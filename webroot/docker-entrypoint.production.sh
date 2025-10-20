#!/bin/bash

cd /code

export NODE_ENV="production"
export API_URL="http://api.specialneeds.com:8000/"
export VERBOSE=0
export PORT=8080

# Run the server.js script with node
node ./server.js
