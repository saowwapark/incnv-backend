import { samplesetDao } from '../databases/incnv/dao/sampleset.dao';
import { uploadCnvToolResultDao } from '../databases/incnv/dao/upload-cnv-tool-result.dao';
import { DgvDao } from '../databases/bio/dao/dgv.dao';
import { EnsemblDao } from '../databases/bio/dao/ensembl.dao';
import { ClinvarDao } from '../databases/bio/dao/clinvar.dao';
import { RegionBpDto } from '../dto/basepair.dto';
import { EnsemblAnnotationDto } from '../databases/bio/dto/ensembl-annotation.dto';
import { ClinvarDto } from '../databases/bio/dto/clinvar.dto';
import { ClinvarAnnotationListDto } from '../dto/analysis/clinvar-annotation-list.dto';
import { reformatCnvToolResultDao } from '../databases/incnv/dao/reformat-cnv-tool-result.dao';
import { MergedBasepairDto } from '../dto/analysis/merged-basepair.dto';
import { CnvInfoDto } from '../dto/analysis/cnv-info.dto';
import { BpGroup } from '../dto/analysis/bp-group';
import { CnvGroupDto } from '../dto/analysis/cnv-group.dto';
import { MERGED_RESULT_NAME } from '../dto/analysis/constants';
import { DgvAnnotationDto } from '../databases/bio/dto/dgv-annotation.dto';

export class AnalysisModel {
  public getSamplesetsToAnalyze = async (userId: number) => {
    return await samplesetDao.getSamplesetsToAnalyze(userId);
  };

  public getUploadCnvToolResultToChoose = async (
    referenceGenome,
    samplesetId
  ) => {
    return await uploadCnvToolResultDao.getUploadCnvToolResultsToChoose(
      referenceGenome,
      samplesetId
    );
  };

  public generateCnvInfos = async (
    referenceGenome,
    chromosome,
    cnvType,
    regionBps: RegionBpDto[] | MergedBasepairDto[]
  ): Promise<CnvInfoDto[]> => {
    const cnvInfos: CnvInfoDto[] = [];
    const dgvDao = new DgvDao(referenceGenome);
    const ensemblDao = new EnsemblDao(referenceGenome);
    const clinvarDao = new ClinvarDao(referenceGenome);

    for (const regionBp of regionBps) {
      const cnvInfo = new CnvInfoDto();
      cnvInfo.referenceGenome = referenceGenome;
      cnvInfo.chromosome = chromosome;
      cnvInfo.cnvType = cnvType;
      cnvInfo.startBp = regionBp.startBp;
      cnvInfo.endBp = regionBp.endBp;

      if (regionBp.constructor.name === 'MergedBasepairDto') {
        cnvInfo.overlaps = (regionBp as MergedBasepairDto).overlaps;
      }

      // dgv
      cnvInfo.dgvs = await this.getDgvAnnotations(
        dgvDao,
        cnvType,
        chromosome,
        regionBp.startBp,
        regionBp.endBp
      );

      // ensembl
      cnvInfo.ensembls = await this.getEnsemblAnnotations(
        ensemblDao,
        chromosome,
        regionBp.startBp,
        regionBp.endBp
      );

      // clinvar
      cnvInfo.clinvar = await this.getClinvarAnnotations(
        clinvarDao,
        chromosome,
        regionBp.startBp,
        regionBp.endBp
      );

      cnvInfos.push(cnvInfo);
    }
    return cnvInfos;
  };

  private getEnsemblAnnotations = async (
    ensemblDao: EnsemblDao,
    chromosome,
    startBp,
    endBp
  ): Promise<EnsemblAnnotationDto[]> => {
    return await ensemblDao.getGeneAnnotaions(chromosome, startBp, endBp);
  };

  private getDgvAnnotations = async (
    dgvDao: DgvDao,
    cnvType,
    chromosome,
    startBp,
    endBp
  ): Promise<DgvAnnotationDto[]> => {
    return await dgvDao.getVariantAccession(
      cnvType,
      chromosome,
      startBp,
      endBp
    );
  };

  private getClinvarAnnotations = async (
    clinvarDao: ClinvarDao,
    chromosome: string,
    startBp: number,
    endBp: number
  ) => {
    const clinvars: ClinvarDto[] = await clinvarDao.getClinvar(
      chromosome,
      startBp,
      endBp
    );
    return this.mergedClinvarAnnotations(clinvars);
  };

  public updateCnvInfo = async (cnvInfo: CnvInfoDto) => {
    let newCnvInfo = new CnvInfoDto();
    newCnvInfo = { ...cnvInfo };
    const dgvDao = new DgvDao(cnvInfo.referenceGenome);
    const ensemblDao = new EnsemblDao(cnvInfo.referenceGenome);
    const clinvarDao = new ClinvarDao(cnvInfo.referenceGenome);

    // ensembl
    newCnvInfo.ensembls = await this.getEnsemblAnnotations(
      ensemblDao,
      cnvInfo.chromosome,
      cnvInfo.startBp,
      cnvInfo.endBp
    );
    // dgv
    newCnvInfo.dgvs = await this.getDgvAnnotations(
      dgvDao,
      cnvInfo.cnvType,
      cnvInfo.chromosome,
      cnvInfo.startBp,
      cnvInfo.endBp
    );

    // clivar
    newCnvInfo.clinvar = await this.getClinvarAnnotations(
      clinvarDao,
      cnvInfo.chromosome!,
      cnvInfo.startBp!,
      cnvInfo.endBp!
    );

    return newCnvInfo;
  };

  private mergedClinvarAnnotations = async (clinvars: ClinvarDto[]) => {
    let uniqueOmims: string[] = [];
    let uniquePhenotypes: string[] = [];
    let uniqueSignificances: string[] = [];
    for (let clinvarIndex = 0; clinvarIndex < clinvars.length; clinvarIndex++) {
      const clinvar = clinvars[clinvarIndex];
      const omims = clinvar.omimIdList!.split(';');
      const phenotypes = clinvar.phenotypeList!.split(';');
      const significances = clinvar.clinicalSignificance!.split(';');
      if (clinvarIndex === 0) {
        uniqueOmims = omims;
        uniquePhenotypes = phenotypes;
        uniqueSignificances = significances;
      } else {
        // find unique omim ids
        for (const omim of omims) {
          const hasOmim: boolean = uniqueOmims.includes(omim);
          !hasOmim ? uniqueOmims.push(omim) : null;
        }
        // find unique phenotypes
        for (const phenotype of phenotypes) {
          const hasPhenotype: boolean = uniquePhenotypes.includes(phenotype);
          !hasPhenotype ? uniquePhenotypes.push(phenotype) : null;
        }

        // find unique clinical significances
        for (const significance of significances) {
          const hasSignificance: boolean = uniqueSignificances.includes(
            significance
          );
          !hasSignificance ? uniqueSignificances.push(significance) : null;
        }
      }
    }

    return new ClinvarAnnotationListDto(
      uniqueOmims,
      uniquePhenotypes,
      uniqueSignificances
    );
  };

  // diffEnd > 0
  public getOverlapOverMergedBp = (
    m: MergedBasepairDto,
    t: RegionBpDto,
    name: string
  ): MergedBasepairDto[] | undefined => {
    // order of result is significant (basepair orders by ascending)
    let results: MergedBasepairDto[] | undefined = undefined;
    const diffStart = t.startBp - m.startBp;
    const overlaps = [...m.overlaps];
    if (diffStart === 0) {
      const r1 = new MergedBasepairDto(m.startBp, m.endBp, [...overlaps, name]);
      results = [r1];
    } else if (diffStart < 0) {
      const r1 = new MergedBasepairDto(t.startBp, m.startBp - 1, [name]);
      const r2 = new MergedBasepairDto(m.startBp, m.endBp, [...overlaps, name]);
      results = [r1, r2];
    } else {
      const r1 = new MergedBasepairDto(m.startBp, t.startBp - 1, overlaps);
      const r2 = new MergedBasepairDto(t.startBp, m.endBp, [...overlaps, name]);
      results = [r1, r2];
    }
    return results;
  };

  // tool cnv not over merged cnv -> remove T
  // diffEnd <= 0
  public getOverlapNotOverMergedBp = (
    m: MergedBasepairDto,
    t: RegionBpDto,
    name: string
  ): MergedBasepairDto[] | undefined => {
    // order of result is significant (basepair orders by ascending)
    let results: MergedBasepairDto[] | undefined = undefined;
    const diffStart = t.startBp - m.startBp;
    const diffEnd = t.endBp - m.endBp;
    const overlaps = [...m.overlaps];
    // M       -----------
    // T ----------
    if (diffStart < 0 && diffEnd < 0) {
      console.log('condition 1');
      const r1 = new MergedBasepairDto(t.startBp, m.startBp - 1, [name]);
      const r2 = new MergedBasepairDto(m.startBp, t.endBp, [...overlaps, name]);
      results = [r1, r2];
    }

    // M ------------
    // T -----
    else if (diffStart === 0 && diffEnd < 0) {
      console.log('condition 2');
      const r1 = new MergedBasepairDto(t.startBp, t.endBp, [...overlaps, name]);
      results = [r1];
    }

    // M -------------
    // T        ------
    else if (diffStart > 0 && diffEnd === 0) {
      console.log('condition 3');
      const r1 = new MergedBasepairDto(m.startBp, t.startBp - 1, overlaps);
      const r2 = new MergedBasepairDto(t.startBp, t.endBp, [...overlaps, name]);
      results = [r1, r2];
    }
    // M --------------
    // T --------------
    else if (diffStart === 0 && diffEnd === 0) {
      console.log('condition 4');
      const r1 = new MergedBasepairDto(m.startBp, m.endBp, [...overlaps, name]);
      results = [r1];
    }

    // M --------------
    // T    ------
    else if (diffStart > 0 && diffEnd < 0) {
      console.log('condition 5');
      const r1 = new MergedBasepairDto(m.startBp, t.startBp - 1, overlaps);
      const r2 = new MergedBasepairDto(t.startBp, t.endBp, [...overlaps, name]);
      results = [r1, r2];
    }

    // M        --------
    // T ---------------
    else if (diffStart < 0 && diffEnd === 0) {
      console.log('condition 6');
      const r1 = new MergedBasepairDto(t.startBp, m.startBp - 1, [name]);
      const r2 = new MergedBasepairDto(m.startBp, m.endBp, [...overlaps, name]);
      results = [r1, r2];
    }
    return results;
  };

  public mergeBps = (
    oldMergedBps: MergedBasepairDto[],
    bps: RegionBpDto[],
    overlapName
  ) => {
    if (oldMergedBps && oldMergedBps.length === 0) {
      // First bps
      for (const bp of bps) {
        const mergedBp = new MergedBasepairDto(bp.startBp, bp.endBp, [
          overlapName
        ]);
        oldMergedBps.push(mergedBp);
      }
      return oldMergedBps;
    } else {
      // each old-merged basepair compare to current cnv tool
      let mIndex = 0;
      while (mIndex < oldMergedBps.length) {
        let oldMergedBp = oldMergedBps[mIndex];
        let clonedBps = [...bps];
        let branchBps: MergedBasepairDto[] = [];

        // each new tool's basepair
        for (const bp of bps) {
          // ignore cnvToolBp on right side of mergedBp
          if (bp.startBp - oldMergedBp.endBp > 0) break;

          // overlap
          if (bp.endBp - oldMergedBp.startBp >= 0) {
            const diffEnd = bp.endBp - oldMergedBp.endBp;
            if (diffEnd <= 0) {
              const mergedBps = analysisModel.getOverlapNotOverMergedBp(
                oldMergedBp,
                bp,
                overlapName
              );
              if (mergedBps) {
                // remove used cnvToolBp
                clonedBps.splice(clonedBps.indexOf(bp), 1);

                branchBps = branchBps.concat(mergedBps);
                oldMergedBp.startBp = bp.endBp + 1;
              }
            } else {
              const mergedBps = analysisModel.getOverlapOverMergedBp(
                oldMergedBp,
                bp,
                overlapName
              );
              if (mergedBps) {
                // change cnvToolBp used
                const newIndex = clonedBps.indexOf(bp);
                clonedBps[newIndex].startBp = oldMergedBp.endBp + 1;

                branchBps = mergedBps;
              }
            }
          }
          // not overlap
          else {
            const mergedBps = new MergedBasepairDto(bp.startBp, bp.endBp, [
              overlapName
            ]);
            // remove used cnvToolBp
            clonedBps.splice(clonedBps.indexOf(bp), 1);

            branchBps.push(mergedBps);
          }
        }
        // update input bps for next loop
        bps = clonedBps;

        if (branchBps.length > 0) {
          // remove changed merged bp
          oldMergedBps.splice(mIndex, 1);

          // insert merged bp instead of removed bp
          oldMergedBps.splice(mIndex, 0, ...branchBps);

          // update merged index
          mIndex = mIndex + branchBps.length;
        } else {
          mIndex++;
        }
      }
    }
    return oldMergedBps;
  };
  /**
   *  Get Merged Bps of multiple samples
   */
  public mergeBpGroups = (bpGroups: BpGroup[]): MergedBasepairDto[] => {
    let mergedBps: MergedBasepairDto[] = [];
    for (const bpGroup of bpGroups) {
      mergedBps = analysisModel.mergeBps(
        mergedBps,
        bpGroup.basepairs!,
        bpGroup.groupName
      );
    }
    return mergedBps;
  };

  /**
   * Annotate Merged Tools
   */
  public annotateMergedBpGroup = async (
    referenceGenome,
    chromosome,
    cnvType,
    toolBpGroups: BpGroup[]
  ): Promise<CnvGroupDto> => {
    const mergedBps: MergedBasepairDto[] = await analysisModel.mergeBpGroups(
      toolBpGroups
    );
    const cnvInfos = await analysisModel.generateCnvInfos(
      referenceGenome,
      chromosome,
      cnvType,
      mergedBps
    );
    return new CnvGroupDto(MERGED_RESULT_NAME, cnvInfos);
  };
}

export const analysisModel = new AnalysisModel();
