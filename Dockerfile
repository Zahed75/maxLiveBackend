# Use the official Node.js 14 image as base
FROM node:14

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the wait-for-it script and make it executable
COPY wait-for-it.sh .
RUN chmod +x wait-for-it.sh

# Copy the rest of the application code
COPY . .

# Expose port 8080
EXPOSE 8080

# Command to run the application
CMD ["./wait-for-it.sh", "mongo:27017", "--", "node", "index.js"]
