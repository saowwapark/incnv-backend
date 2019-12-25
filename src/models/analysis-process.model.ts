import { BasepairDto } from './../dto/basepair.dto';
import { EnsemblDao } from '../databases/bio-grch37/dao/ensembl.dao';
import { reformatCnvToolResultDao } from '../databases/incnv/dao/reformat-cnv-tool-result.dao';
import { DgvDao } from '../databases/bio-grch37/dao/dgv.dao';
import { UploadCnvToolResultDto } from '../databases/incnv/dto/upload-cnv-tool-result.dto';

class CnvToolDetail {
  cnvToolIdentity?: string; // cnv tool name and parameter.
  cnvToolAnnotations?: CnvAnnotation[]; // annotation for a given cnv tool.
}
class CnvAnnotation {
  chromosome?: string;
  cnvType?: string;
  startBasepair?: number;
  endBasepair?: number;
  dgv?: string[]; //dgv.variant_accession
  ensembl?: string[]; //ensembl.gene_id
  clinvar;
}
export class AnalysisProcessModel {
  referenceGenome: string;
  sample: string;
  cnvType: string;
  chromosome: string;
  constructor(referenceGenome, sample, cnvType, chromosome) {
    this.referenceGenome = referenceGenome;
    this.sample = sample;
    this.cnvType = cnvType;
    this.chromosome = chromosome;
  }

  public getAllCnvToolDetails = async (
    uploadCnvToolResults: UploadCnvToolResultDto[]
  ): Promise<CnvToolDetail[]> => {
    const cnvAnnotatedForAllTools: any[] = [];
    for (const uploadCnvToolResult of uploadCnvToolResults) {
      const cnvAnnotatedForOneTool = await this.getCnvAnnotatedForOneTool(
        uploadCnvToolResult.uploadCnvToolResultId!,
        this.sample
      );
      const cnvToolDetail: CnvToolDetail = {
        cnvToolIdentity: `${uploadCnvToolResult.cnvToolName}_${uploadCnvToolResult.fileInfo}`,
        cnvToolAnnotations: cnvAnnotatedForOneTool
      };
      cnvAnnotatedForAllTools.push(cnvToolDetail);
    }

    return cnvAnnotatedForAllTools;
  };

  public getMergedBasepairs = async (
    uploadCnvToolResults: UploadCnvToolResultDto[]
  ) => {
    let mergedCnvToolBps: BasepairDto[] = [];
    // each tool
    for (let index = 0; index < uploadCnvToolResults.length; index++) {
      const uploadCnvToolResult = uploadCnvToolResults[index];
      const cnvToolBps: BasepairDto[] = await reformatCnvToolResultDao.getBasepairs(
        uploadCnvToolResult.uploadCnvToolResultId,
        this.sample,
        this.cnvType,
        this.chromosome
      );
      let results: BasepairDto[] = [];
      // initialize first mergedCnvToolBps
      if (index === 0) {
        mergedCnvToolBps = cnvToolBps;
        continue;
      }
      // initialize second...last mergedCnvToolBps
      else {
        // each new basepair
        for (const cnvToolBp of cnvToolBps) {
          // each old-merged basepair
          for (const mergedBp of mergedCnvToolBps!) {
            if (cnvToolBp.startBasepair - mergedBp.startBasepair < 0)
              mergedBp.startBasepair = cnvToolBp.startBasepair;
            if (cnvToolBp.endBasepair - mergedBp.endBasepair > 0)
              mergedBp.endBasepair = cnvToolBp.endBasepair;

             results.push(mergedBp); // don't need to do this --pass by reference
          }
        }
         mergedCnvToolBps = results;
      }
    }
    return mergedCnvToolBps;
  };

  public getCnvAnnotatedForOneTool = async (
    uploadCnvToolResultId: number,
    sample: string
  ) => {
    // baseparis for one cnv tool
    const basepairs = await reformatCnvToolResultDao.getBasepairs(
      uploadCnvToolResultId,
      sample,
      this.cnvType,
      this.chromosome
    );

    const chrAnnotations: CnvAnnotation[] = [];
    const dgvDao = new DgvDao(this.referenceGenome);
    const ensemblDao = new EnsemblDao(this.referenceGenome);

    for (const basepair of basepairs) {
      const fragmentAnnotation = new CnvAnnotation();
      fragmentAnnotation.chromosome = this.chromosome;
      fragmentAnnotation.cnvType = this.cnvType;
      fragmentAnnotation.startBasepair = basepair.startBasepair;
      fragmentAnnotation.endBasepair = basepair.endBasepair;

      // dgv
      const dgvData = await dgvDao.getVariantAccession(
        this.cnvType,
        this.chromosome,
        basepair.startBasepair,
        basepair.endBasepair
      );
      fragmentAnnotation.dgv = dgvData;

      // ensembl
      const ensemblData = await ensemblDao.getGeneId(
        this.chromosome,
        basepair.startBasepair,
        basepair.endBasepair
      );
      fragmentAnnotation.ensembl = ensemblData;

      chrAnnotations.push(fragmentAnnotation);
    }
    return chrAnnotations;
  };

  public test = async () => {};
}
