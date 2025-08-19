# Base image (local)
#FROM node:22.16.0
#WORKDIR /app
#COPY package*.json ./
#RUN npm install
#COPY . .
#EXPOSE 3000
#CMD ["npm", "run", "start:dev"]


#Base image (Deploy server)

# -------------------------
# Stage 1: Build
# -------------------------
FROM node:22-alpine AS builder

# Set working directory
WORKDIR /app

# Copy package.json & package-lock.json
COPY package*.json ./

# Install all dependencies (dev + prod) để build
RUN npm install

# Copy toàn bộ source
COPY . .

# Build NestJS project
RUN npx prisma generate
RUN npm run build

# -------------------------
# Stage 2: Production
# -------------------------
FROM node:22-alpine

WORKDIR /app

# Chỉ copy package.json & package-lock.json
COPY package*.json ./

# Cài chỉ production dependencies
RUN npm install --production

# Copy dist từ stage build
COPY --from=builder /app/dist ./dist

# Copy các file cần thiết khác (ví dụ prisma schema)
COPY --from=builder /app/prisma ./prisma

# Expose port NestJS
EXPOSE 3000

# Env variable PORT để Render có thể override
ENV PORT=3000

# CMD: chạy server production
CMD ["node", "dist/main.js"]
