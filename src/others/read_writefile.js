const fs = require('fs');

const appendFile = () => {
  const line = fs.
    readFileSync('./source/variant_summary.txt').
    toString().
    split('\n');

  fs.appendFileSync('./result/variant_hg19.txt', line.toString() + '\n');
};

const getHeaderFile = tabFileMapping => {
  const absolutePath =
    '/Users/saowwapark/Documents/Master_Degree' +
    '/Thesis/coding/inCNV/3_Develop/backend/file-system/uploads';
  const fileName = 'fullbam_noy_calls.txt-1570620981478.txt';
  const file = `${absolutePath}/${fileName}`;
};
