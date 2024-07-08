FROM node:20
RUN mkdir -p /usr/app/src
WORKDIR /usr/app

# Copy only the necessary files for the build
COPY src/ ./src/
COPY package.json package-lock.json tsconfig.json ./

# Install dependencies and build the project
RUN npm ci
RUN npm run build

# Remove everything except the dist folder
RUN rm -rf src package-lock.json tsconfig.json

EXPOSE 3000
CMD ["npm", "run", "prod"]