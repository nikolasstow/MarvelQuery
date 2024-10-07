# Use an official Node.js runtime as a parent image
FROM node:20

# Set the working directory
WORKDIR /lib

# Copy the package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Run the performance tests
CMD ["pnpm", "run", "test"]