#!/bin/sh
set -e

echo "Starting entrypoint script..."

# Generate env-config.js from template
envsubst < /usr/share/nginx/html/env.template.js > /usr/share/nginx/html/env-config.js

echo "env-config.js created"
cat /usr/share/nginx/html/env-config.js

# Start NGINX
exec nginx -g 'daemon off;'