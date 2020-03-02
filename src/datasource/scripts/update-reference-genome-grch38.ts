import fs from 'fs-extra';
import * as path from 'path';
import unzipper from 'unzipper';
import {
  datasourceTmpDir,
  referenceGenomeGrch38FastaFilePath,
  referenceGenomeGrch38FaiFilePath
} from '../../config/path-config';
import { utilityDatasource } from './utility-datasource';

export class UpdateReferenceGenomeGrch38 {
  private readonly url =
    'https://api.github.com/repos/saowwapark/inCNV-datasource/releases/latest';
  private readonly expectedZipFileName = 'reference_genome_grch38.zip';
  private readonly expectedZipFilePath = path.join(
    datasourceTmpDir,
    this.expectedZipFileName
  );
  private readonly tmpExtractedDirPath = path.join(
    datasourceTmpDir,
    'reference_genome_grch38'
  );

  checkShouldUpdateVersion = () => {
    const datasourceVersion = utilityDatasource.getDatasourceVersion();
    const referenceGenomeGrch38Versions =
      datasourceVersion.referenceGenomeGrch38Versions;

    let isShouldUpdate: boolean = true;
    for (const referenceGenomeGrch38Version of referenceGenomeGrch38Versions) {
      const releasedVersion = referenceGenomeGrch38Version.releasedVersion;
      if (releasedVersion && releasedVersion.length > 0) {
        console.log('not update reference genome GRCh38');
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
      if (fileName.includes('.fa.fai')) {
        this.moveFile(extractedFilePath, referenceGenomeGrch38FaiFilePath);
      } else if (fileName.includes('.fa')) {
        this.moveFile(extractedFilePath, referenceGenomeGrch38FastaFilePath);
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
    const referenceGenomeGrch38Versions =
      datasourceVersion.referenceGenomeGrch38Versions;
    // update db version
    referenceGenomeGrch38Versions[0].fileName = 'new fasta grch38';
    referenceGenomeGrch38Versions[0].releasedVersion = 'new released version';
    referenceGenomeGrch38Versions[0].srcReleasedDate = 'new released date';

    referenceGenomeGrch38Versions[1].fileName = 'new fasta index grch38';
    referenceGenomeGrch38Versions[1].releasedVersion = 'new released version';
    referenceGenomeGrch38Versions[1].srcReleasedDate = 'new released date';

    return datasourceVersion;
  };
}

export const updateReferenceGenomeGrch38 = new UpdateReferenceGenomeGrch38();
