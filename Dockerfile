FROM node:latest

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY package.json .
RUN npm install --production
COPY . ./
RUN npm install pm2 -g
WORKDIR /usr/src/app/src
RUN ls
EXPOSE 3000
CMD ["pm2","start","app.js","-i","0"]