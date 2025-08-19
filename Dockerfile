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
# -------------------------
# Stage 1: Build
# -------------------------
FROM node:22-alpine AS builder

# Cài thêm bash và openssl (Prisma cần trong một số trường hợp)
RUN apk add --no-cache bash openssl

WORKDIR /app

# Copy package.json và package-lock.json trước → cache npm install
COPY package*.json ./

# Cài dependencies
RUN npm install

# Copy toàn bộ source code
COPY . .

# Sinh Prisma client
RUN npx prisma generate

# Build NestJS
RUN npm run build

# -------------------------
# Stage 2: Production
# -------------------------
FROM node:22-alpine

WORKDIR /app

# Copy chỉ production dependencies
COPY package*.json ./
RUN npm install --production

# Copy thư mục dist từ builder
COPY --from=builder /app/dist ./dist

# Copy Prisma client từ builder
COPY --from=builder /app/prisma ./prisma

# Copy node_modules từ builder để tránh thiếu dependency
COPY --from=builder /app/node_modules ./node_modules

# Set port cho Render
ENV PORT=3000

# Expose port
EXPOSE 3000

# Start server và chạy migration nếu cần
# Fix đường dẫn main.js đúng với NestJS 14+
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main.js"]


