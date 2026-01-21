# Vite Frontend Dockerfile
FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

# Build for production
RUN npm run build

# Preview/Serve
# For dev we might override command in docker-compose, but for prod image:
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]
