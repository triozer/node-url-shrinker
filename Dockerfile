# Use the official Bun image
FROM oven/bun:1

# Set the working directory
WORKDIR /

# Copy package.json and bun.lockb (if it exists)
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Generate and run migrations
RUN bun drizzle-kit migrate

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["bun", "run", "dev"]