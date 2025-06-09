# Gunakan image node resmi
FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy semua file ke container
COPY . .

# Build Prisma client (jika perlu)
RUN npx prisma generate

# Expose port (misal 4000 untuk Apollo Server)
EXPOSE 4000

# Command untuk start server
CMD ["sh", "-c", "npx prisma migrate deploy && npm run dev && node src/index.js"]  