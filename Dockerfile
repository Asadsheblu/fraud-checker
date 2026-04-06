FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application files
COPY . .

# Build the frontend
RUN npm run build

# Expose ports
EXPOSE 3000 5173

# Install backend dependencies
WORKDIR /app/server
RUN npm ci --only=production

# Go back to root
WORKDIR /app

# Start both frontend and backend
CMD ["sh", "-c", "npm run build && cd server && npm start &  cd .. && npm run preview"]
