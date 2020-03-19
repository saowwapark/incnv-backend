FROM keymetrics/pm2:latest-alpine

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . ./
RUN npm install
RUN npm run build
RUN npm install pm2 -g
RUN ls
EXPOSE 3000
CMD [ "pm2-runtime", "start", "pm2.json" ]