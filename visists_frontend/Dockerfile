# Use Node.js for development
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose port 3000 (as configured in vite.config.ts)
EXPOSE 3000

# Start the development server
CMD ["npm", "run", "dev"]