FROM node:latest

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . ./
RUN npm install
RUN npm run build
RUN npm install pm2 -g
WORKDIR /usr/src/app/src
RUN ls
EXPOSE 3000
CMD ["pm2","start","app.js","-i","0"]