import fs from 'fs-extra';
import * as path from 'path';
import unzipper from 'unzipper';
import {
  datasourceTmpDir,
  referenceGenomeGrch37FastaFilePath,
  referenceGenomeGrch37FaiFilePath
} from '../../config/path-config';
import { utilityDatasource } from './utility-datasource';

export class UpdateReferenceGenomeGrch37 {
  private readonly url =
    'https://api.github.com/repos/saowwapark/inCNV-datasource/releases/latest';
  private readonly expectedZipFileName = 'ucsc__hg18__2006-2-3.zip';
  private readonly expectedZipFilePath = path.join(
    datasourceTmpDir,
    this.expectedZipFileName
  );
  private readonly tmpExtractedDirPath = path.join(
    datasourceTmpDir,
    'ucsc__hg18__2006-2-3'
  );

  checkShouldUpdateVersion = () => {
    const datasourceVersion = utilityDatasource.getDatasourceVersion();
    const referenceGenomeGrch37Versions =
      datasourceVersion.referenceGenomeGrch38Versions;

    let isShouldUpdate: boolean = true;
    for (const referenceGenomeGrch37Version of referenceGenomeGrch37Versions) {
      const releasedDate = referenceGenomeGrch37Version.releasedDate;
      if (releasedDate && releasedDate.length > 0) {
        console.log('not update reference genome GRCh37');
        isShouldUpdate = false;
        return isShouldUpdate;
      }
    }
    return isShouldUpdate;
  };

  main = async () => {
    let shouldUpdate: boolean = this.checkShouldUpdateVersion();
    if (!shouldUpdate) return;

    const data = await utilityDatasource.getDatasource(
      this.url,
      this.expectedZipFileName
    );

    utilityDatasource.saveRetrievedFile(this.expectedZipFilePath, data);

    // extract zip file
    const readStream = fs.createReadStream(this.expectedZipFilePath);
    readStream
      .pipe(unzipper.Extract({ path: datasourceTmpDir }))
      .on('error', function(err) {
        console.log('error to unzip', err);
      })
      .on('close', async () => {
        console.log('extract zip SUCCESS!!');
        this.modifyFile();

        // remove zip file
        fs.removeSync(this.expectedZipFilePath);
        // remove extracted directory
        fs.removeSync(this.tmpExtractedDirPath);

        // update db version
        const updatedDatasourceVersion = this.createDatasourceVersion();
        utilityDatasource.writeDatasourceVersion(updatedDatasourceVersion);
      });
  };

  private modifyFile() {
    const fileNames = fs.readdirSync(this.tmpExtractedDirPath);
    console.log('tmpExtractedDir: ' + this.tmpExtractedDirPath);
    console.log('fileNames: ' + fileNames);
    for (const fileName of fileNames) {
      const extractedFilePath = path.join(this.tmpExtractedDirPath, fileName);
      if (fileName === 'ucsc_hg18.fa') {
        this.moveFile(extractedFilePath, referenceGenomeGrch37FastaFilePath);
      } else if (fileName === 'ucsc_hg18.fa.fai') {
        this.moveFile(extractedFilePath, referenceGenomeGrch37FaiFilePath);
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

  private createDatasourceVersion = () => {
    const datasourceVersion = utilityDatasource.getDatasourceVersion();
    const referenceGenomeGrch37Versions =
      datasourceVersion.referenceGenomeGrch37Versions;
    // update db version
    referenceGenomeGrch37Versions[0].fileName = 'new fasta grch37';
    referenceGenomeGrch37Versions[0].releasedDate = 'new released date';
    referenceGenomeGrch37Versions[0].modifiedDate = 'new modified';

    referenceGenomeGrch37Versions[1].fileName = 'new fasta index grch37';
    referenceGenomeGrch37Versions[1].releasedDate = 'new released date';
    referenceGenomeGrch37Versions[1].modifiedDate = 'new modified';
    return datasourceVersion;
  };
}

export const updateReferenceGenomeGrch37 = new UpdateReferenceGenomeGrch37();
