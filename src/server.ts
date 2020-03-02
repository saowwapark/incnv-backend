/** Third Party Packages **/
import http from 'http';
import express from 'express';
import { App } from './app';
import * as config from './db-env';
import { updateDatasource } from './datasource/scripts/update-datasource';
import { LocalFile } from './models/read-reference-genome/local-file';
import { IndexedFasta } from './models/read-reference-genome/indexed-fasta';
import {
  referenceGenomeGrch37FastaFilePath,
  referenceGenomeGrch37FaiFilePath,
  referenceGenomeGrch38FastaFilePath,
  referenceGenomeGrch38FaiFilePath
} from './config/path-config';
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

// async-await at top level
(async () => {
  console.log(
    '--------------------------------- Check Update Datasource --------------------------------'
  );
  await updateDatasource.main();

  console.log(
    '--------------------------------- Check Update Datasource SUCCESS!!--------------------------------'
  );
})();

// open reference genome both grch37 and grch38
const fastaGrch37 = new LocalFile(referenceGenomeGrch37FastaFilePath);
const faiGrch37 = new LocalFile(referenceGenomeGrch37FaiFilePath);
const configGrch37 = {
  fasta: fastaGrch37,
  fai: faiGrch37,
  path: '',
  faiPath: '',
  chunkSizeLimit: 1000000
};
export const indexedFastaGrch37 = new IndexedFasta(configGrch37);

const fastaGrch38 = new LocalFile(referenceGenomeGrch38FastaFilePath);
const faiGrch38 = new LocalFile(referenceGenomeGrch38FaiFilePath);
const configGrch38 = {
  fasta: fastaGrch38,
  fai: faiGrch38,
  path: '',
  faiPath: '',
  chunkSizeLimit: 1000000
};
export const indexedFastaGrch38 = new IndexedFasta(configGrch38);

module.exports = server;
