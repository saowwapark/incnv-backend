/** Third Party Packages **/
import http from 'http';
import express from 'express';
import { App } from './app';
import * as config from './config';

class Server {
  port: number;
  hostname: string;
  server: http.Server;

  constructor(port, hostname, app) {
    this.port = this.normalizePort(port);
    this.hostname = hostname;

    // create server according to setting application
    this.server = http.createServer(app);
    this.server.listen(this.port, this.hostname);
    this.config();
  }

  config() {
    this.server.on('error', this.onError);
  }

  private onError(error) {
    if (error.syscall !== 'listen') {
      throw error;
    }
    const bind =
      typeof this.port === 'string' ? 'pipe ' + this.port : 'port ' + this.port;
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges');
        process.exit(1);
        break;
      case 'EADDRINUSE':
        console.error(bind + ' is already in use');
        process.exit(1);
        break;
      default:
        throw error;
    }
  }

  private normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
      // named pipe
      return val;
    }

    if (port >= 0) {
      // port number
      return port;
    }

    return false;
  }
}

// setting application
const app: express.Application = App.bootstrap().app;
// create server
const server = new Server(config.port, config.host, app).server;
module.exports = server;
