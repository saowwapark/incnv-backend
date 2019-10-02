var fs = require('fs');

var lines = fs
  .readFileSync('./source/variant_summary.txt')
  .toString()
  .split('\n');

fs.appendFileSync('./result/variant_hg19.txt', line.toString() + '\n');
