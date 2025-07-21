# Use Node.js LTS version as base image
FROM node:22
# Set working directory
WORKDIR /app

# Copy application source code AFTER dependencies are installed
# This creates /app/apps/* and /app/libs/*
COPY libs ./libs
COPY apps ./apps
# Copy package files and Yarn configuration
COPY package.json .yarnrc.yml yarn.lock tsconfig.json ./
COPY .yarn ./.yarn

# Enable Yarn Berry
RUN corepack enable && \
    yarn set version berry

# Install dependencies
# Clear any potentially copied host cache first for a clean install.
# Use --immutable to ensure consistency with the lockfile.
RUN rm -rf .yarn/cache && yarn install

# Build the application
RUN yarn build

# Expose port (adjust if needed)
EXPOSE 3000

# Start the application with environment variables
CMD ["yarn", "start"]
