import { createDatabase } from './create-database';
import { databases } from './database-const';
import { updateDatabase } from './update-database';
import { updateDgvAllVariants } from './update-dgv-all-varaint';
import { updateReferenceGenomeGrch37 } from './update-reference-genome-grch37';
import { updateReferenceGenomeGrch38 } from './update-reference-genome-grch38';
import { utilityDatasource } from './utility-datasource';
import { datasourceTmpDir } from '../../config/path.config';

export class UpdateDatasource {
  main = async () => {
    try {
      await createDatabase.crateDb(databases).then(
        result => {
          console.log(result);
        },
        error => {
          console.error(error);
        }
      );

      await updateDatabase.main().then(
        result => {
          console.log(result);
        },
        error => {
          console.error(error);
        }
      );

      await updateDgvAllVariants.main().then(
        result => {
          console.log(result);
        },
        error => {
          console.error(error);
        }
      );
      await updateReferenceGenomeGrch37.main().then(
        result => {
          console.log(result);
        },
        error => {
          console.error(error);
        }
      );

      await updateReferenceGenomeGrch38.main().then(
        result => {
          console.log(result);
        },
        error => {
          console.error(error);
        }
      );

      utilityDatasource.deleteFiles(datasourceTmpDir);
    } catch (err) {
      const originalVersion = utilityDatasource.getDatasourceOriginalVersion();
      utilityDatasource.writeDatasourceVersion(originalVersion);
    }
  };
}

export const updateDatasource = new UpdateDatasource();
