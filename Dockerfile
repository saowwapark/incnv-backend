FROM keymetrics/pm2:latest-jessie

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . ./
RUN npm install
RUN npm run build
RUN npm install pm2 -g
WORKDIR /usr/src/app/dist/src
COPY pm2.json ./
RUN ls
EXPOSE 3000
CMD [ "pm2-runtime", "start", "pm2.json" ]