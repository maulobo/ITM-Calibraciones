# Backend Dockerfile with Puppeteer support
FROM node:18-alpine

# Install system dependencies for Puppeteer/Chromium
# Installs latest chromium package
RUN apk add --no-cache \
      chromium \
      nss \
      freetype \
      freetype-dev \
      harfbuzz \
      ca-certificates \
      ttf-freefont \
      nodejs \
      yarn

# Tell Puppeteer to skip installing Chrome. We'll use the installed package.
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

COPY . .

# Build the application
RUN npm run build

EXPOSE 4000

# Start command
CMD ["npm", "run", "start:prod"]