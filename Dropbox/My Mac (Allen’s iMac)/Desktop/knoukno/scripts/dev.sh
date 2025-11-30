#!/usr/bin/env sh
set -e

echo "Running build steps..."
npm run build:css
npx prisma generate

echo "Starting nodemon..."
START_SERVER=1 nodemon --watch src --watch public --watch scss --exec node src/server.mjs
