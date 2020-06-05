import { createDatabase } from './create-database';
import { databases } from './database-const';
import { updateDatabase } from './update-database';
import { updateDgvAllVariants } from './update-dgv-all-varaint';
import { updateReferenceGenomeGrch37 } from './update-reference-genome-grch37';
import { updateReferenceGenomeGrch38 } from './update-reference-genome-grch38';
import { utilityDatasource } from './utility-datasource';
import { DATASOURCES_TMP_DIR_PATH } from '../../config/path.config';

export class UpdateDatasource {
  main = async () => {
    try {
      const createDbLog = await createDatabase.crateDb(databases);
      console.log(createDbLog);

      const updateDbLog = await updateDatabase.main();
      console.log(updateDbLog);

      const updateDgvAllVariantsLog = await updateDgvAllVariants.main();
      console.log(updateDgvAllVariantsLog);

      const updateReferenceGenomeGrch37Log = await updateReferenceGenomeGrch37.main();
      console.log(updateReferenceGenomeGrch37Log);

      const updateReferenceGenomeGrch38Log = await updateReferenceGenomeGrch38.main();
      console.log(updateReferenceGenomeGrch38Log);

      utilityDatasource.deleteFiles(DATASOURCES_TMP_DIR_PATH);
    } catch (err) {
      console.error(err);
      const originalVersion = utilityDatasource.getDatasourceOriginalVersion();
      utilityDatasource.writeDatasourceVersion(originalVersion);
    }
  };
}

export const updateDatasource = new UpdateDatasource();
