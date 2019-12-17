import * as mysql from 'mysql2/promise';
import * as ssh from 'ssh2';

const Client = ssh.Client;

const conn = new Client();

const testConfig = {
  host: '127.0.0.1',
  user: 'root',
  password: 'glk;4k8',
  database: 'mew-test'
};

const sshStream = new Promise((resolve, reject) => {
  conn
    .on('ready', function() {
      console.log('Client :: ready');

      conn.forwardOut('127.0.0.1', 3306, '127.0.0.1', 3306, function(
        err,
        stream
      ) {
        if (err) throw err;
        resolve(stream);
      });
    })
    .connect({
      host: '35.247.160.223',
      port: 22,
      username: 'saowwapark',
      privateKey: require('fs').readFileSync('/Users/saowwapark/.ssh/id_rsa')
    });
});

const stream = (async function() {
  console.log('test in stream');
  return await sshStream;
})();

const sql = `SELECT * FROM kan_table_1 limit 10`;
console.log(sql);
const testPool = mysql.createPool({ ...testConfig, stream: stream });
testPool.query(sql).then(value => {
  console.log(value);
});
