FROM oven/bun:latest

# Install GraphicsMagick and Ghostscript as required dependencies
RUN apt-get update && \
    apt-get install -y graphicsmagick ghostscript && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Create app directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install app dependencies using Bun
RUN bun install

# Copy app source
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run the application
CMD ["bun", "upload.js"]
