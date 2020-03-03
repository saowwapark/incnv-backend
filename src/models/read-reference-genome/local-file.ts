const { promisify } = require('es6-promisify');
import fs from 'fs';

const fsOpen = fs && promisify(fs.open);
const fsRead = fs && promisify(fs.read);
const fsFStat = fs && promisify(fs.fstat);
const fsReadFile = fs && promisify(fs.readFile);
const fsClose = fs && promisify(fs.close);

export class LocalFile {
  position;
  filename;
  fd;
  _stat;
  constructor(source) {
    this.position = 0;
    this.filename = source;
    this.fd = fsOpen(this.filename, 'r');
  }

  async closeFile() {
    return fsClose(this.fd);
  }
  async read(buffer, offset = 0, length, position) {
    let readPosition = position;
    if (readPosition === null) {
      readPosition = this.position;
      this.position += length;
    }
    const ret = await fsRead(await this.fd, buffer, offset, length, position);
    if (typeof ret === 'object') return ret.bytesRead;
    return ret;
  }

  async readFile() {
    return fsReadFile(this.filename);
  }

  async stat() {
    if (!this._stat) {
      this._stat = await fsFStat(await this.fd);
    }
    return this._stat;
  }
}
