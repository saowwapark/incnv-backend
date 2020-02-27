export class DatasourceVersion {
  dbVersions: DatabaseVersion[] = [];
  dgvAllVariantsVersions: FileVersion[] = [];
  referenceGenomeGrch37Versions: FileVersion[] = [];
  referenceGenomeGrch38Versions: FileVersion[] = [];
}

export class DatabaseVersion {
  databaseName: string = '';
  tables: TableVersion[] = [];
}

export class TableVersion {
  tableName: string = '';
  releasedDate: string = '';
  modifiedDate: string = '';
}

export class FileVersion {
  fileName: string = '';
  releasedDate: string = '';
  modifiedDate: string = '';
}
