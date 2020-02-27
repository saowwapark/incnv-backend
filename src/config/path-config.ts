import path from 'path';

// /backend/src/datasource/datasource-version.json
// /backend/src/tmp
export const staticDir = path.join(__dirname, '..', 'public');
export const tmpDir = path.join(__dirname, '..', 'tmp');
export const cnvToolResultTmpDir = path.join(tmpDir, 'cnv-tool-result');
export const srcDirPath = path.join(__dirname, '..');
export const datasourceTmpDir = path.join(tmpDir, 'datasource');

export const datasourceDirPath = path.join(__dirname, '..', 'datasource');
export const datasourceVersionPath = path.join(
  datasourceDirPath,
  'datasource-version.json'
);
export const referenceGenomeDirPath = path.join(
  datasourceDirPath,
  'reference_genome'
);
export const referenceGenomeGrch37FastaFilePath = path.join(
  referenceGenomeDirPath,
  'ucsc_hg18.fa'
);
export const referenceGenomeGrch37FaiFilePath = path.join(
  referenceGenomeDirPath,
  'ucsc_hg18.fa.fai'
);
export const referenceGenomeGrch38FastaFilePath = path.join(
  referenceGenomeDirPath,
  'ucsc_hg19.fa'
);
export const referenceGenomeGrch38FaiFilePath = path.join(
  referenceGenomeDirPath,
  'ucsc_hg19.fa.fai'
);
export const dgvAllVariantsDirPath = path.join(
  datasourceDirPath,
  'dgv_all_variants'
);
export const dgvAllVariantsGrch37FilePath = path.join(
  dgvAllVariantsDirPath,
  'dgv_all_variants_grch37'
);
export const dgvAllVariantsGrch38FilePath = path.join(
  dgvAllVariantsDirPath,
  'dgv_all_variants_grch38'
);
