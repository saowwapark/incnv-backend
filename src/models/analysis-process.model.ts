import { BasepairDto } from './../dto/basepair.dto';
import { EnsemblDao } from '../databases/bio-grch37/dao/ensembl.dao';
import { reformatCnvToolResultDao } from '../databases/incnv/dao/reformat-cnv-tool-result.dao';
import { DgvDao } from '../databases/bio-grch37/dao/dgv.dao';
import { UploadCnvToolResultDto } from '../databases/incnv/dto/upload-cnv-tool-result.dto';

class CnvToolAnnotationDto {
  cnvToolIdentity?: string; // cnv tool name and parameter.
  cnvToolAnnotations?: CnvFragmentAnnotationDto[]; // annotation for a given cnv tool.
}
class CnvFragmentAnnotationDto {
  chromosome?: string;
  cnvType?: string;
  startBp?: number;
  endBp?: number;
  overlapTools?: string[];
  dgv?: string[]; //dgv.variant_accession
  ensembl?: string[]; //ensembl.gene_id
  clinvar;
}

// class CnvMergedAnnotationDto {
//   chromosome?: string;
//   cnvType?: string;
//   overlapNumber?: number;
//   startBp?: number;
//   endBp?: number;
//   dgv?: string[]; //dgv.variant_accession
//   ensembl?: string[]; //ensembl.gene_id
//   clinvar;
// }

class MergedBasepairDto extends BasepairDto {
  overlapTools: string[];

  constructor(startBp, endBp, overlapTools) {
    super(startBp, endBp);
    this.overlapTools = overlapTools;
  }
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

  public annotateMultipleTools = async (
    uploadCnvToolResults: UploadCnvToolResultDto[]
  ): Promise<CnvToolAnnotationDto[]> => {
    const annotatedTools: any[] = [];
    for (const uploadCnvToolResult of uploadCnvToolResults) {
      const basepairs = await this.getBasepairFromOneTool(
        uploadCnvToolResult.uploadCnvToolResultId!,
        this.sample
      );
      const toolAnnotation = await this.getAnnotations(basepairs);
      const annotatedTool: CnvToolAnnotationDto = {
        cnvToolIdentity: `${uploadCnvToolResult.cnvToolName}_${uploadCnvToolResult.fileInfo}`,
        cnvToolAnnotations: toolAnnotation
      };
      annotatedTools.push(annotatedTool);
    }

    return annotatedTools;
  };

  public annotateMergedTools = async (
    uploadCnvToolResults: UploadCnvToolResultDto[]
  ) => {
    const mergedBps: MergedBasepairDto[] = await this.mergeCnvTools(
      uploadCnvToolResults
    );
    const cnvAnnotations = await this.getAnnotations(mergedBps);
    return {
      cnvToolIdentity: `merged tools`,
      cnvToolAnnotations: cnvAnnotations
    };
  };

  private printCnvToolIdentity(cnvToolName, cnvParam) {
    return `${cnvToolName}_${cnvParam}`;
  }

  private mergeCnvTools = async (
    uploadCnvToolResults: UploadCnvToolResultDto[]
  ): Promise<MergedBasepairDto[]> => {
    let mergedCnvToolBps: MergedBasepairDto[] = [];

    // each tool
    for (let index = 0; index < uploadCnvToolResults.length; index++) {
      const uploadCnvToolResult = uploadCnvToolResults[index];
      const cnvToolIdentity = this.printCnvToolIdentity(
        uploadCnvToolResult.cnvToolName,
        uploadCnvToolResult.fileInfo
      );

      let cnvToolBps: BasepairDto[] = await reformatCnvToolResultDao.getBasepairs(
        uploadCnvToolResult.uploadCnvToolResultId,
        this.sample,
        this.cnvType,
        this.chromosome
      );
      // First cnv tool
      // -- initialize first mergedCnvToolBps and go to next iteration
      if (index === 0) {
        for (const cnvToolBp of cnvToolBps) {
          const mergedCnvToolBp = {
            ...cnvToolBp,
            overlapTools: [cnvToolIdentity]
          };
          mergedCnvToolBps.push(mergedCnvToolBp);
        }
        continue;
      }
      // Second cnv tool to last
      else {
        let newMergedBps: MergedBasepairDto[] = [];

        // each old-merged basepair compare to current cnv tool
        for (let mergedBp of mergedCnvToolBps!) {
          let newCnvToolBps = [...cnvToolBps];

          // each new basepair
          for (const currentToolBp of cnvToolBps) {
            // ignore cnvToolBp on right side of mergedBp
            if (currentToolBp.startBp - mergedBp.endBp > 0) break;

            // overlap
            if (currentToolBp.endBp - mergedBp.startBp >= 0) {
              const diffEnd = currentToolBp.endBp - mergedBp.endBp;
              if (diffEnd <= 0) {
                const results = this.getOverlapNotOverMergedBp(
                  mergedBp,
                  currentToolBp,
                  cnvToolIdentity
                );
                if (results) {
                  // remove used cnvToolBp
                  newCnvToolBps.splice(newCnvToolBps.indexOf(currentToolBp), 1);

                  newMergedBps = newMergedBps.concat(results);
                  mergedBp.startBp = currentToolBp.endBp + 1;
                }
              } else {
                const results = this.getOverlapOverMergedBp(
                  mergedBp,
                  currentToolBp,
                  cnvToolIdentity
                );
                if (results) {
                  // change cnvToolBp used
                  const newIndex = newCnvToolBps.indexOf(currentToolBp);
                  newCnvToolBps[newIndex].startBp = mergedBp.endBp + 1;

                  newMergedBps = results;
                }
              }
            }
            // not overlap
            else {
              const result = new MergedBasepairDto(
                currentToolBp.startBp,
                currentToolBp.endBp,
                [cnvToolIdentity]
              );
              // remove used cnvToolBp
              newCnvToolBps.splice(newCnvToolBps.indexOf(currentToolBp), 1);

              newMergedBps.push(result);
            }
          }
          cnvToolBps = newCnvToolBps;
        }

        mergedCnvToolBps = newMergedBps;
      }
    }
    return mergedCnvToolBps;
  };

  // diffEnd > 0
  private getOverlapOverMergedBp = (
    m: MergedBasepairDto,
    t: BasepairDto,
    name: string
  ): MergedBasepairDto[] | undefined => {
    // order of result is significant (basepair orders by ascending)
    let results: MergedBasepairDto[] | undefined = undefined;
    const diffStart = t.startBp - m.startBp;
    if (diffStart === 0) {
      const r1 = new MergedBasepairDto(
        m.startBp,
        m.endBp,
        m.overlapTools.push(name)
      );
      results = [r1];
    } else if (diffStart < 0) {
      const r1 = new MergedBasepairDto(t.startBp, m.startBp - 1, [name]);
      const r2 = new MergedBasepairDto(
        m.startBp,
        m.endBp,
        m.overlapTools.push(name)
      );
      results = [r1, r2];
    } else {
      const r1 = new MergedBasepairDto(
        m.startBp,
        t.startBp - 1,
        m.overlapTools
      );
      const r2 = new MergedBasepairDto(
        t.startBp,
        m.endBp,
        m.overlapTools.push(name)
      );
      results = [r1, r2];
    }
    return results;
  };

  // tool cnv not over merged cnv -> remove T
  // diffEnd <= 0
  private getOverlapNotOverMergedBp = (
    m: MergedBasepairDto,
    t: BasepairDto,
    name: string
  ): MergedBasepairDto[] | undefined => {
    // order of result is significant (basepair orders by ascending)
    let results: MergedBasepairDto[] | undefined = undefined;
    const diffStart = t.startBp - m.startBp;
    const diffEnd = t.endBp - m.endBp;
    // M       -----------
    // T ----------
    if (diffStart < 0 && diffEnd < 0) {
      console.log('condition 1');
      const r1 = new MergedBasepairDto(t.startBp, m.startBp - 1, [name]);
      const r2 = new MergedBasepairDto(
        m.startBp,
        t.endBp,
        m.overlapTools.push(name)
      );
      results = [r1, r2];
    }

    // M ------------
    // T -----
    else if (diffStart === 0 && diffEnd < 0) {
      console.log('condition 2');
      const r1 = new MergedBasepairDto(
        t.startBp,
        t.endBp,
        m.overlapTools.push(name)
      );
      results = [r1];
    }

    // M -------------
    // T        ------
    else if (diffStart > 0 && diffEnd === 0) {
      console.log('condition 3');
      const r1 = new MergedBasepairDto(
        m.startBp,
        t.startBp - 1,
        m.overlapTools
      );
      const r2 = new MergedBasepairDto(
        t.startBp,
        t.endBp,
        m.overlapTools.push(name)
      );
      results = [r1, r2];
    }
    // M --------------
    // T --------------
    else if (diffStart === 0 && diffEnd === 0) {
      console.log('condition 4');
      const r1 = new MergedBasepairDto(
        m.startBp,
        m.endBp,
        m.overlapTools.push(name)
      );
      results = [r1];
    }

    // M --------------
    // T    ------
    else if (diffStart > 0 && diffEnd < 0) {
      console.log('condition 5');
      const r1 = new MergedBasepairDto(
        m.startBp,
        t.startBp - 1,
        m.overlapTools
      );
      const r2 = new MergedBasepairDto(
        t.startBp,
        t.endBp,
        m.overlapTools.push(name)
      );
      results = [r1, r2];
    }

    // M        --------
    // T ---------------
    else if (diffStart < 0 && diffEnd === 0) {
      console.log('condition 6');
      const r1 = new MergedBasepairDto(t.startBp, m.startBp - 1, [name]);
      const r2 = new MergedBasepairDto(
        m.startBp,
        m.endBp,
        m.overlapTools.push(name)
      );
      results = [r1, r2];
    }
    return results;
  };

  private getBasepairFromOneTool = async (
    uploadCnvToolResultId: number,
    sample: string
  ) => {
    // baseparis for one cnv tool
    return await reformatCnvToolResultDao.getBasepairs(
      uploadCnvToolResultId,
      sample,
      this.cnvType,
      this.chromosome
    );
  };

  private getAnnotations = async (
    basepairs: BasepairDto[] | MergedBasepairDto[]
  ): Promise<CnvFragmentAnnotationDto[]> => {
    const annotations: CnvFragmentAnnotationDto[] = [];
    const dgvDao = new DgvDao(this.referenceGenome);
    const ensemblDao = new EnsemblDao(this.referenceGenome);

    for (const basepair of basepairs) {
      const fragmentAnnotation = new CnvFragmentAnnotationDto();
      fragmentAnnotation.chromosome = this.chromosome;
      fragmentAnnotation.cnvType = this.cnvType;
      fragmentAnnotation.startBp = basepair.startBp;
      fragmentAnnotation.endBp = basepair.endBp;

      if (basepair.constructor.name === 'MergedBasepairDto') {
        fragmentAnnotation.overlapTools = (basepair as MergedBasepairDto).overlapTools;
      }

      // dgv
      const dgvData = await dgvDao.getVariantAccession(
        this.cnvType,
        this.chromosome,
        basepair.startBp,
        basepair.endBp
      );
      fragmentAnnotation.dgv = dgvData;

      // ensembl
      const ensemblData = await ensemblDao.getGeneId(
        this.chromosome,
        basepair.startBp,
        basepair.endBp
      );
      fragmentAnnotation.ensembl = ensemblData;

      annotations.push(fragmentAnnotation);
    }
    return annotations;
  };

  public test = async () => {};
}
