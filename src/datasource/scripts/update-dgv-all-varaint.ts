import { DatasourceVersion, TableVersion } from './datasource-version.model';
import fs from 'fs-extra';
import * as path from 'path';
import unzipper from 'unzipper';
import rimraf from 'rimraf';
import {
  datasourceTmpDir,
  dgvAllVariantsGrch37FilePath,
  dgvAllVariantsGrch38FilePath
} from '../../config/path.config';
import { utilityDatasource } from './utility-datasource';

/**
 * download file
 */
export class UpdateDgvAllVariants {
  private readonly url =
    'https://api.github.com/repos/saowwapark/inCNV-datasource/releases/latest';
  private readonly expectedZipFileName = 'dgv_all_variants.zip';
  private readonly expectedZipFilePath = path.join(
    datasourceTmpDir,
    this.expectedZipFileName
  );
  private readonly tmpExtractedDirPath = path.join(
    datasourceTmpDir,
    'dgv_all_variants'
  );

  checkShouldUpdateVersion = () => {
    const datasourceVersion = utilityDatasource.getDatasourceVersion();
    const dgvAllVariantsVersions = datasourceVersion.dgvAllVariantsVersions; // grch37 && grch38

    let isShouldUpdate: boolean = true;
    for (const dgvAllVariantsVersion of dgvAllVariantsVersions) {
      const releasedVersion = dgvAllVariantsVersion.releasedVersion;
      if (releasedVersion && releasedVersion.length > 0) {
        isShouldUpdate = false;
        return isShouldUpdate;
      }
    }
    return isShouldUpdate;
  };

  main = async (): Promise<string> => {
    let shouldUpdate: boolean = this.checkShouldUpdateVersion();
    if (!shouldUpdate)
      return Promise.resolve('-> Dgv all varaint should not be updated');

    const data: ArrayBuffer = await utilityDatasource.getDatasource(
      this.url,
      this.expectedZipFileName
    );
    // /tmp/datasource/db__datasource.zip
    utilityDatasource.saveRetrievedFile(this.expectedZipFilePath, data);

    const readStream = fs.createReadStream(this.expectedZipFilePath);

    return new Promise((resolve, reject) => {
      // extract a zip file and write new files
      readStream
        .pipe(unzipper.Extract({ path: datasourceTmpDir }))
        .on('error', function(err) {
          reject('!! Error to unzip DGV all varaint\n' + err.stack);
        })
        .on('close', async () => {
          this.modifyFile();

          // remove zip file
          fs.removeSync(this.expectedZipFilePath);
          // remove extracted directory
          fs.removeSync(this.tmpExtractedDirPath);

          // // update DatasourceVersion
          // const updatedDatasourceVersion = this.createDatasourceVersion();
          // utilityDatasource.writeDatasourceVersion(updatedDatasourceVersion);
          resolve(
            '---------------------  update DGV all variant success!! --------------------'
          );
        });
    });
  };

  private modifyFile() {
    const fileNames = fs.readdirSync(this.tmpExtractedDirPath);
    console.log('tmpExtractedDir: ' + this.tmpExtractedDirPath);
    console.log('fileNames: ' + fileNames);
    for (const fileName of fileNames) {
      const extractedFilePath = path.join(this.tmpExtractedDirPath, fileName);
      if (fileName.includes('grch37')) {
        this.moveFile(extractedFilePath, dgvAllVariantsGrch37FilePath);
      } else if (fileName.includes('grch38')) {
        this.moveFile(extractedFilePath, dgvAllVariantsGrch38FilePath);
      }
    }
  }
  private moveFile(oldPath: string, newPath: string) {
    console.log('oldPath: ' + oldPath);
    console.log('newPath: ' + newPath);

    fs.removeSync(newPath);
    fs.moveSync(oldPath, newPath);
    console.log('moveFileSuccess!!');
  }
  private deleteDir(dirPath: string) {
    fs.rmdirSync(dirPath);
  }

  private createDatasourceVersion = () => {
    const datasourceVersion = utilityDatasource.getDatasourceVersion();
    const dgvAllVariantsVersions = datasourceVersion.dgvAllVariantsVersions;
    // update db version
    for (const dgvAllVariantsVersion of dgvAllVariantsVersions) {
      dgvAllVariantsVersion.fileName = 'new dgvAllVariants';
      dgvAllVariantsVersion.releasedVersion = 'new released version';
      dgvAllVariantsVersion.srcReleasedDate = 'new released date';
    }
    return datasourceVersion;
  };
}

export const updateDgvAllVariants = new UpdateDgvAllVariants();
