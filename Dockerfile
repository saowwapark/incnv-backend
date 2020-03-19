FROM node:latest

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json .
RUN npm install --production
COPY . ./
RUN npm install pm2 -g
EXPOSE 3000
CMD ["pm2","start","src/server.js","-i","0"]