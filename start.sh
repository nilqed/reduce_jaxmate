#!/bin/bash
echo "Press CTRL-C to stop the server"
export BROWSER=firefox
sensible-browser http://localhost:3010 & 
node reduce_server.js