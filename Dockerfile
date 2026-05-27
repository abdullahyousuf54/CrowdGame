FROM node:20-slim

# Install system dependencies (needed for node-gyp, sqlite3, or sharp builds if compiling from source)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /usr/src/app

COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application source
COPY . .

EXPOSE 3000

ENV NODE_ENV=production

CMD ["node", "server.js"]
