import axios from 'axios';
import fs from 'fs';
import * as path from 'path';
import extract from 'extract-zip';
import unzipper from 'unzipper';
import rimraf from 'rimraf';

const test = async () => {
  const lastest = (
    await axios.get(
      'https://api.github.com/repos/saowwapark/inCNV-datasource/releases/latest'
    )
  ).data;

  const version = lastest.tag_name;
  const assets = lastest.assets;
  const tmpDir = path.join(__dirname, '..', 'tmp', 'datasource');

  for (const asset of assets) {
    const url = asset.browser_download_url;
    console.log(url);
    const filename: string = asset.name;
    if (filename === 'clinvar-datasource.zip') {
      const data = (await axios.get(url, { responseType: 'arraybuffer' })).data;

      const zipFilePath = path.join(tmpDir, filename);
      const indexOfZip = filename.indexOf('.zip');
      const extractedFilePath = path.join(
        tmpDir,
        filename.slice(0, indexOfZip)
      );
      console.log(extractedFilePath);

      // write zip file in server
      fs.writeFileSync(zipFilePath, data);
      console.log(`${filename} was saved!`);

      fs.createReadStream(zipFilePath)
        .pipe(unzipper.Extract({ path: tmpDir }))
        .pipe(unzipper.Parse())
        .on('entry', function(entry) {
          const unzipDir = path.join(tmpDir, entry.path);
          entry.pipe(fs.createWriteStream(unzipDir));

          // if (fileName === "this IS the file I'm looking for") {
          //   entry.pipe(fs.createWriteStream('output/path'));
          // } else {
          //   entry.autodrain();
          // }
        });

      rimraf('/some/directory', function() {
        console.log('done');
      });

      // extract(zipFilePath, { dir: tmpDir }, function(err) {
      //   // extraction is complete. make sure to handle the err

      //   try {
      //     fs.unlinkSync(zipFilePath);
      //     console.log('remove zip file success!!');
      //     fs.unlinkSync(extractedFilePath);
      //     console.log('remove extract files success!!');
      //     //file removed
      //   } catch (err) {
      //     console.error(err);
      //   }
      // });
    }
  }
};

test();
