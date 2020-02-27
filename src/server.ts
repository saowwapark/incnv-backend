import { utilityDatasource } from './datasource/scripts/utility-datasource';
import { updateDatabase } from './datasource/scripts/update-database';
import { DatabaseScript, databases } from './datasource/scripts/database-const';
import { createDatabase } from './datasource/scripts/create-database';
/** Third Party Packages **/
import http from 'http';
import express from 'express';
import { App } from './app';
import * as config from './db-env';
import IO from './socket';
import cluster from 'cluster';
import { updateDgvAllVariants } from './datasource/scripts/update-dgv-all-varaint';
import { updateReferenceGenomeGrch37 } from './datasource/scripts/update-reference-genome-grch37';
import { updateReferenceGenomeGrch38 } from './datasource/scripts/update-reference-genome-grch38';
import { datasourceTmpDir } from './config/path-config';

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

/******************************** Main ******************************/

// setting application
const app: express.Application = App.bootstrap().app;

// create server
const server = new Server(config.port, config.host, app).server;
// // create socket io (don' need now)
// const io = IO.init(server);
// io.on('connection', function(socket: any) {
//   console.log('a user connected');
//   socket.on('disconnect', () => {
//     console.log('Client disconnected');
//   });
// });

// // async-await at top level
// (async() => {
//   await createDatabase.crateDb(databases);
//   console.log('check create db success!!');
//   await updateDatabase.main();
//   console.log('check update db success!!');
//   await updateDgvAllVariants.main();
//   await updateReferenceGenomeGrch37.main();
//   await updateReferenceGenomeGrch38.main();
// })()

// create and update database
// createDatabase.crateDb(databases).then(() => {
//   console.log('check create db success!!');
//   updateDatabase.main().then(() => {
//     console.log('check update db success!!');
//   });
// });
// updateDgvAllVariants.main();
// updateReferenceGenomeGrch37.main();
// updateReferenceGenomeGrch38.main();

// utilityDatasource.deleteFiles(datasourceTmpDir);

createDatabase.crateDb(databases).then(() => {
  console.log('check create db success!!');
});

module.exports = server;
