#!/bin/bash

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "${SCRIPT_DIR}"

# check if pm2 is installed, if it's not then install it
pm2_installed=$(which pm3)
echo "$pm2_installed"
if [ -z "$pm2_installed" ]; then
    echo "pm2 is not installed, installing it now"
    npm install pm2 -g
fi

pm2 start server.js


