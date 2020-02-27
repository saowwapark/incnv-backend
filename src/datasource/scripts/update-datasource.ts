import { createDatabase } from './create-database';
import { databases } from './database-const';
import { updateDatabase } from './update-database';
import { updateDgvAllVariants } from './update-dgv-all-varaint';
import { updateReferenceGenomeGrch37 } from './update-reference-genome-grch37';
import { updateReferenceGenomeGrch38 } from './update-reference-genome-grch38';
import { utilityDatasource } from './utility-datasource';
import { datasourceTmpDir } from '../../config/path-config';

export class UpdateDatasource {
  main = async () => {
    try {
      await createDatabase.crateDb(databases);
      console.log(
        '---------------------  check create db success!! --------------------'
      );
      await updateDatabase.main();
      console.log(
        '--------------------- check update db success!! ---------------------'
      );
      await updateDgvAllVariants.main();
      console.log(
        '---------------------  Update DGV all variant success!! --------------------'
      );
      await updateReferenceGenomeGrch37.main();
      console.log(
        '---------------------  Update Reference Genome Grch37 success!! --------------------'
      );
      await updateReferenceGenomeGrch38.main();
      console.log(
        '---------------------  Update Reference Genome Grch38 success!! --------------------'
      );
      utilityDatasource.deleteFiles(datasourceTmpDir);
    } catch (err) {
      const originalVersion = utilityDatasource.getDatasourceOriginalVersion();
      utilityDatasource.writeDatasourceVersion(originalVersion);
    }
  };
}

export const updateDatasource = new UpdateDatasource();
