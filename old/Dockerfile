# Frontend Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

COPY . .

# Next.js build
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
