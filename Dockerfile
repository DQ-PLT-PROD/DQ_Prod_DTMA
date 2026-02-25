
# Step 1: Use an official Node.js image from Docker Hub
FROM node:20

# Step 2: Set the working directory in the container
WORKDIR /app

ENV NODE_OPTIONS="--max-old-space-size=4096"

# Step 3: Copy package.json and package-lock.json if available
COPY package*.json ./

# Step 4: Install app dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Disable lint & type-check, increase Node heap
ENV NEXT_DISABLE_ESLINT=1
ENV NEXT_DISABLE_TYPECHECK=1

# Build the Next.js app
RUN npm run build --no-lint

# Step 6: Expose the port the app runs on
EXPOSE 3000

# Step 7: Define the command to run the app

CMD ["npm", "run", "preview", "--", "--host", "0.0.0.0"]


