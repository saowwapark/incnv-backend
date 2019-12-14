"use strict";
exports.__esModule = true;
var mysql = require("mysql2/promise");
var ssh = require("ssh2");
var Client = ssh.Client;
var conn = new Client();
// const db = new Promise((resolve, reject) => {
//   conn
//     .on('ready', function() {
//       console.log('Client :: ready');
//       conn.forwardOut('127.0.0.1', 3306, '127.0.0.1', 3306, function(
//         err,
//         stream
//       ) {
//         if (err) throw err;
//         stream
//           .on('close', function() {
//             console.log('TCP :: CLOSED');
//             conn.end();
//           })
//           .on('data', function(data) {
//             console.log('TCP :: DATA: ' + data);
//           })
//           .end(
//             [
//               'HEAD / HTTP/1.1',
//               'User-Agent: curl/7.27.0',
//               'Host: 127.0.0.1',
//               'Accept: */*',
//               'Connection: close',
//               '',
//               ''
//             ].join('\r\n')
//           );
//         resolve(stream);
//       });
//     })
//     .connect({
//       host: '35.247.160.223',
//       port: 22,
//       username: 'saowwapark',
//       privateKey: require('fs').readFileSync('/Users/saowwapark/.ssh/id_rsa')
//     });
// });
// db.then(() => {
//   const testPool = mysql.createPool(testConfig);
//   // const connection = mysql.createConnection(testConfig);
//   const sql = `SELECT * FROM kan_table_1 limit 10`;
//   console.log(sql);
//   testPool.query(sql).then(value => {
//     console.log(value);
//   });
// });
conn
    .on('ready', function () {
    console.log('Client :: ready');
    conn.forwardOut('127.0.0.1', 3306, '127.0.0.1', 3306, function (err, stream) {
        if (err)
            throw err;
        // stream
        //   .on('close', function() {
        //     console.log('TCP :: CLOSED');
        //     conn.end();
        //   })
        //   .on('data', function(data) {
        //     console.log('TCP :: DATA: ' + data);
        //   })
        //   .end(
        //     [
        //       'HEAD / HTTP/1.1',
        //       'User-Agent: curl/7.27.0',
        //       'Host: 127.0.0.1',
        //       'Accept: */*',
        //       'Connection: close',
        //       '',
        //       ''
        //     ].join('\r\n')
        //   );
        var testConfig = {
            host: '127.0.0.1',
            user: 'root',
            password: 'glk;4k8',
            database: 'mew-test',
            stream: stream
        };
        var testPool = mysql.createPool(testConfig);
        var sql = mysql.format("SELECT * FROM kan_table_1");
        console.log(sql);
        testPool.query(sql).then(function (value) {
            console.log(value);
        });
    });
})
    .connect({
    host: '35.247.160.223',
    port: 22,
    username: 'saowwapark',
    privateKey: require('fs').readFileSync('/Users/saowwapark/.ssh/id_rsa')
});
