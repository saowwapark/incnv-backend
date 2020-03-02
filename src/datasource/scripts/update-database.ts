import { TableVersion } from './datasource-version.model';
import axios from 'axios';
import fs from 'fs-extra';
import * as path from 'path';
import unzipper from 'unzipper';
import { dbPool } from '../../config/database';
import { datasourceTmpDir } from './../../config/path-config';

import mysqlPromise from 'mysql2/promise';
import { databases, TableScript } from './database-const';
import { utilityDatasource } from './utility-datasource';

export class UpdateDatabase {
  private readonly url =
    'https://api.github.com/repos/saowwapark/inCNV-datasource/releases/latest';
  private readonly expectedZipFileName = 'db_datasource.zip';
  private readonly expectedZipFilePath = path.join(
    datasourceTmpDir,
    this.expectedZipFileName
  );
  private readonly tmpExtractedDirPath = path.join(
    datasourceTmpDir,
    'db_datasource'
  );

  checkShouldUpdateVersion = () => {
    const datasourceVersion = utilityDatasource.getDatasourceVersion();
    const dbVersions = datasourceVersion.dbVersions;

    let isShouldUpdate: boolean = true;
    for (const currentDbVersion of dbVersions) {
      const dbNameVersion = currentDbVersion.databaseName;
      const tableVersions: TableVersion[] = currentDbVersion.tables;
      for (const tableVersion of tableVersions) {
        const tableName = tableVersion.tableName;
        const releasedVersion = tableVersion.releasedVersion;
        if (releasedVersion && releasedVersion.length > 0) {
          console.log('not update table');
          isShouldUpdate = false;
          return isShouldUpdate;
        }
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
    // /tmp/datasource/db__datasource.zip
    const zipFilePath = path.join(datasourceTmpDir, this.expectedZipFileName);
    utilityDatasource.saveRetrievedFile(zipFilePath, data);

    // extract zip file
    const readStream = fs.createReadStream(zipFilePath);
    readStream
      .pipe(unzipper.Extract({ path: datasourceTmpDir }))
      .on('error', function(err) {
        console.log('error to unzip', err);
      })
      .on('close', async () => {
        console.log('extract zip SUCCESS!!');

        await this.updateTable();

        // remove zip file
        fs.removeSync(this.expectedZipFilePath);
        // remove extracted directory
        fs.removeSync(this.tmpExtractedDirPath);

        // update db version
        const updatedDatasourceVersion = this.createUpdatedDatasourceVersion();
        utilityDatasource.writeDatasourceVersion(updatedDatasourceVersion);
      });
  };

  private createUpdatedDatasourceVersion = () => {
    const datasourceVersion = utilityDatasource.getDatasourceVersion();
    const dbVersions = datasourceVersion.dbVersions;
    // update db version
    for (const dbVersion of dbVersions) {
      const tableVersions: TableVersion[] = dbVersion.tables;
      for (const tableVersion of tableVersions) {
        tableVersion.releasedVersion = 'new released version';
        tableVersion.srcReleasedDate = 'new released date';
      }
    }
    return datasourceVersion;
  };

  private updateTable = async () => {
    let files: string[] = [];
    try {
      files = fs.readdirSync(this.tmpExtractedDirPath);
    } catch (err) {
      console.error('Could not list the directory.', err);
      process.exit(1);
    }
    const tableList = ['ensembl', 'dgv', 'clinvar'];
    let bioGrch37Tables: TableScript[] = [];
    let bioGrch38Tables: TableScript[] = [];

    for (const database of databases) {
      if (database.databaseName === 'bio_grch37') {
        bioGrch37Tables = database.tables;
      } else if (database.databaseName === 'bio_grch38') {
        bioGrch38Tables = database.tables;
      }
    }

    for (const fullFileName of files) {
      // example: ensembl__grch37__2017-03-20.txt
      const fileTypeIndex = fullFileName.indexOf('.txt');
      const fileName = fullFileName.substring(0, fileTypeIndex);
      const fileNameParts = fileName.split('__');
      const tableName: string = fileNameParts[0];
      const databaseName =
        fileNameParts[1] === 'grch37' ? 'bio_grch37' : 'bio_grch38';
      // const releasedDate: Date = new Date(fileNameParts[2]);

      if (tableList.indexOf(tableName) > -1) {
        const filePath = path.join(this.tmpExtractedDirPath, fullFileName);
        const dataList = this.getTableData(filePath);
        const insertSql = this.getInsertSql(
          databaseName,
          tableName,
          bioGrch37Tables,
          bioGrch38Tables
        );

        await this.loadDataIntoTable(
          databaseName,
          tableName,
          insertSql,
          dataList
        );
      }
    }
  };

  private getInsertSql = (
    databaseName: string,
    tableName: string,
    bioGrch37Tables: TableScript[],
    bioGrch38Tables: TableScript[]
  ) => {
    let insertSql = '';

    for (const bioGrch37Table of bioGrch37Tables) {
      if (
        tableName === bioGrch37Table.tableName &&
        databaseName === 'bio_grch37'
      ) {
        insertSql = bioGrch37Table.insertSql!;
        break;
      }
    }
    for (const bioGrch38Table of bioGrch38Tables) {
      if (
        tableName === bioGrch38Table.tableName &&
        databaseName === 'bio_grch38'
      ) {
        insertSql = bioGrch38Table.insertSql!;
        break;
      }
    }
    return insertSql;
  };

  private loadDataIntoTable = async (
    databaseName: string,
    tableName: string,
    insertSql: string,
    dataList: any[]
  ) => {
    // remove data
    const removedSql = `TRUNCATE TABLE ${databaseName}.${tableName}`;

    (await dbPool).query(removedSql, async (error, results, fields) => {
      if (error) throw error;
      // console.log('The solution is: ', results[0].solution);
      console.log(removedSql);

      // add data
      const statement = mysqlPromise.format(insertSql, [dataList]);

      dbPool.query(statement, (error, results, fields) => {
        console.log(insertSql);
        if (error) {
          throw error;
        }
        console.log(`INSERT TABLE ${databaseName}.${tableName} SUCCESS!!`);
        // console.log('The solution is: ', results[0].solution);
      });
    });
  };

  private getTableData = (filePath: string) => {
    const context = fs.readFileSync(filePath, 'utf8');
    const lines = context.split('\n');

    const dataList: any[] = [];
    for (let i = 1; i < lines.length; i++) {
      // start at second line => ignore first line

      const line = lines[i];

      // ignore line space
      if (!line || line === '') continue;

      // ignore a commented line
      if (line.charAt(0) === '#') continue;

      const data = line.split('\t');
      dataList.push(data);
    }
    return dataList;
  };
}

export const updateDatabase = new UpdateDatabase();
