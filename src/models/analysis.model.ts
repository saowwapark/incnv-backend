import { indexedFastaGrch37, indexedFastaGrch38 } from './../server';
import { IndexedFasta } from './read-reference-genome/indexed-fasta';
import {
  dgvAllVariantsGrch38FilePath,
  referenceGenomeGrch38FastaFilePath,
  referenceGenomeGrch37FastaFilePath,
  referenceGenomeGrch37FaiFilePath,
  referenceGenomeGrch38FaiFilePath
} from './../config/path-config';
import { AnnotationStoredproc } from './../databases/bio/dao/annotation-storedproc.dao';
import { SequenceDto } from './../dto/analysis/sequence.dto';
import { samplesetDao } from '../databases/incnv/dao/sampleset.dao';
import { uploadCnvToolResultDao } from '../databases/incnv/dao/upload-cnv-tool-result.dao';
import { DgvDao } from '../databases/bio/dao/dgv.dao';
import { EnsemblDao } from '../databases/bio/dao/ensembl.dao';
import { ClinvarDao } from '../databases/bio/dao/clinvar.dao';
import { RegionBpDto } from '../dto/basepair.dto';
import { EnsemblAnnotationDto } from '../databases/bio/dto/ensembl-annotation.dto';
import { ClinvarDto } from '../databases/bio/dto/clinvar.dto';
import { ClinvarAnnotationListDto } from '../dto/analysis/clinvar-annotation-list.dto';
import { MergedBasepairDto } from '../dto/analysis/merged-basepair.dto';
import { CnvInfoDto } from '../dto/analysis/cnv-info.dto';
import { BpGroup } from '../dto/analysis/bp-group';
import { CnvGroupDto } from '../dto/analysis/cnv-group.dto';
import { MERGED_RESULT_NAME } from '../dto/analysis/constants';
import {
  DgvAnnotationDto,
  DgvAnnotationKey
} from '../databases/bio/dto/dgv-annotation.dto';
import { mergedBasepairModel } from './merged-basepair.model';
import * as path from 'path';
import fs from 'fs';
import { dgvAllVariantsGrch37FilePath } from '../config/path-config';

export class AnalysisModel {
  public getDgvAllVarirants = (refereceGenome: string, chromosome: string) => {
    let dir: string;
    if (refereceGenome === 'grch37') {
      dir = dgvAllVariantsGrch37FilePath;
    } else if (refereceGenome === 'grch38') {
      dir = dgvAllVariantsGrch38FilePath;
    } else {
      throw `reference genome must be 'grch37' or 'grch38'`;
    }
    // const dir = path.join(
    //   __dirname,
    //   '..',
    //   'datasource',
    //   'dgv_all_variants',
    //   refereceGenome
    // );
    const fileName = `dgv_chr${chromosome.toUpperCase()}_all_variants.txt`;
    const context = fs.readFileSync(path.join(dir, fileName));
    const dgvAllVariants = JSON.parse(context.toString());
    return dgvAllVariants;
  };

  public getFlanking = async (
    referenceGenome: string,
    chromosome: string,
    startBp: number,
    endBp: number,
    size: number
  ): Promise<[SequenceDto, SequenceDto]> => {
    // let fastaPath: string;
    // let faiPath: string;
    let t: IndexedFasta;
    const chr = `chr${chromosome}`;
    const leftFlanking: SequenceDto = new SequenceDto();
    const rightFlanking: SequenceDto = new SequenceDto();

    if (referenceGenome === 'grch37') {
      // fastaPath = referenceGenomeGrch37FastaFilePath;
      // faiPath = referenceGenomeGrch37FaiFilePath;
      t = indexedFastaGrch37;
    } else if (referenceGenome === 'grch38') {
      // fastaPath = referenceGenomeGrch38FastaFilePath;
      // faiPath = referenceGenomeGrch38FaiFilePath;
      t = indexedFastaGrch38;
    } else {
      throw `reference genome must be 'grch37' or 'grch38'`;
    }

    // const fasta = new LocalFile(fastaPath);
    // const fai = new LocalFile(faiPath);
    // const t = new IndexedFasta({
    //   fasta: fasta,
    //   fai: fai
    // });

    try {
      // left flanking
      leftFlanking.chromosome = chromosome;
      const leftFlankingStartBp = startBp - size; // this library use 0-based ex. get first 10 bases, "t.getSequence('chr1', 0, 10)"
      leftFlanking.startBp = leftFlankingStartBp <= 0 ? 0 : leftFlankingStartBp;
      leftFlanking.endBp = startBp - 1 <= 0 ? 0 : startBp;
      leftFlanking.sequence = await t.getSequence(
        chr,
        leftFlanking.startBp,
        leftFlanking.endBp
      );

      // right flanking
      const chrSize = await t.getSequenceSize(chr); // t.getSequenceSize('chr1');
      rightFlanking.chromosome = chromosome;

      rightFlanking.startBp = endBp <= chrSize ? endBp : chrSize;
      rightFlanking.endBp = endBp + size <= chrSize ? endBp + size : chrSize;
      rightFlanking.sequence = await t.getSequence(
        chr,
        rightFlanking.startBp,
        rightFlanking.endBp
      );
    } catch (err) {
      throw `reference_genome: ${referenceGenome}, chromosome: ${chromosome}, start_bp: ${startBp}, end_bp: ${endBp}\n${err}`;
    }

    return [leftFlanking, rightFlanking];
  };

  public getStartAndEndSequence(
    fn,
    chr: string,
    startBp: number,
    endBp: number
  ) {
    let startSequence = new SequenceDto();
    let endSequence = new SequenceDto();
    const size = 150;
    if (endBp - startBp > size) {
      startSequence.sequence = fn(chr, startBp, startBp + size - 1);
      endSequence.sequence = fn(chr, endBp - size, endBp);
    } else {
      startSequence.sequence = fn(chr, startBp, endBp);
      endSequence.sequence = '';
    }
    return [startSequence, endSequence];
  }

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

  private generateCnvInfo = async (
    referenceGenome: string,
    chromosome: string,
    cnvType: string,
    regionBp: RegionBpDto
  ): Promise<CnvInfoDto> => {
    const cnvInfo = new CnvInfoDto();
    cnvInfo.referenceGenome = referenceGenome;
    cnvInfo.chromosome = chromosome;
    cnvInfo.cnvType = cnvType;
    cnvInfo.startBp = regionBp.startBp;
    cnvInfo.endBp = regionBp.endBp;

    if (regionBp.constructor.name === 'MergedBasepairDto') {
      cnvInfo.overlaps = (regionBp as MergedBasepairDto).overlaps;
    }

    [
      cnvInfo.ensembls,
      cnvInfo.dgvs,
      cnvInfo.clinvar
    ] = await this.getCnvAnnotations(cnvInfo);

    const [leftFlanking, rightFlanking] = await this.getFlanking(
      referenceGenome,
      chromosome,
      regionBp.startBp,
      regionBp.endBp,
      150
    );
    cnvInfo.leftFlanking = leftFlanking;
    cnvInfo.rightFlanking = rightFlanking;
    return cnvInfo;
  };

  /**
   *  @param RegionBpDto[]
   *  Get CNV Infos of basepair regions and bio database
   */
  public generateCnvInfos = async (
    referenceGenome: string,
    chromosome: string,
    cnvType: string,
    regionBps: RegionBpDto[]
  ): Promise<CnvInfoDto[]> => {
    console.log('-- generateCnvInfos');
    const cnvInfos: Promise<CnvInfoDto[]> = Promise.all(
      regionBps.map(regionBp => {
        return this.generateCnvInfo(
          referenceGenome,
          chromosome,
          cnvType,
          regionBp
        );
      })
    );
    return cnvInfos;
  };

  mapVariantSubtypeKey = (
    dgvAnnotations: DgvAnnotationDto[]
  ): DgvAnnotationKey[] => {
    const keys = ['duplication', 'deletion', 'gain', 'loss', 'gain+loss'];
    const duplicationArray: DgvAnnotationDto[] = [];
    const deletionArray: DgvAnnotationDto[] = [];
    const gainArray: DgvAnnotationDto[] = [];
    const lossArray: DgvAnnotationDto[] = [];
    const gainAndLossArray: DgvAnnotationDto[] = [];

    for (const dgvAnnotation of dgvAnnotations) {
      if (dgvAnnotation.variantSubtype === 'duplication') {
        duplicationArray.push(dgvAnnotation);
      } else if (dgvAnnotation.variantSubtype === 'deletion') {
        deletionArray.push(dgvAnnotation);
      } else if (dgvAnnotation.variantSubtype === 'gain') {
        gainArray.push(dgvAnnotation);
      } else if (dgvAnnotation.variantSubtype === 'loss') {
        lossArray.push(dgvAnnotation);
      } else if (dgvAnnotation.variantSubtype === 'gain+loss') {
        gainAndLossArray.push(dgvAnnotation);
      }
    }

    const DgvAnnotationKeys: DgvAnnotationKey[] = [];
    DgvAnnotationKeys.push({ key: 'duplication', values: duplicationArray });
    DgvAnnotationKeys.push({ key: 'deletion', values: deletionArray });
    DgvAnnotationKeys.push({ key: 'gain', values: gainArray });
    DgvAnnotationKeys.push({ key: 'loss', values: lossArray });
    DgvAnnotationKeys.push({ key: 'gain+loss', values: gainAndLossArray });
    return DgvAnnotationKeys;
  };

  public getCnvAnnotations = async (
    cnvInfo: CnvInfoDto
  ): Promise<
    [EnsemblAnnotationDto[], DgvAnnotationKey[], ClinvarAnnotationListDto]
  > => {
    let newCnvInfo = new CnvInfoDto();
    newCnvInfo = { ...cnvInfo };
    const dgvDao = new DgvDao(cnvInfo.referenceGenome!);
    const ensemblDao = new EnsemblDao(cnvInfo.referenceGenome!);
    const clinvarDao = new ClinvarDao(cnvInfo.referenceGenome!);

    let dgvAnnotations: DgvAnnotationDto[];

    [
      newCnvInfo.ensembls,
      dgvAnnotations,
      newCnvInfo.clinvar
    ] = await Promise.all([
      ensemblDao.getGeneAnnotaions(
        cnvInfo.chromosome!,
        cnvInfo.startBp!,
        cnvInfo.endBp!
      ),
      dgvDao.getVariantAccessions(
        cnvInfo.chromosome!,
        cnvInfo.startBp!,
        cnvInfo.endBp!
      ),
      this.getClinvarAnnotations(
        clinvarDao,
        cnvInfo.chromosome!,
        cnvInfo.startBp!,
        cnvInfo.endBp!
      )
    ]);

    const dgvKeys = this.mapVariantSubtypeKey(dgvAnnotations);
    return [newCnvInfo.ensembls, dgvKeys, newCnvInfo.clinvar];
  };

  public mergedClinvarAnnotations = (
    clinvars: ClinvarDto[]
  ): ClinvarAnnotationListDto => {
    let uniqueOmims: string[] = [];
    let uniquePhenotypes: string[] = [];
    let uniqueSignificances: string[] = [];
    if (!clinvars) return {};
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

  /**
   * Annotate Merged Tools
   */
  public annotateMergedBpGroup = async (
    referenceGenome: string,
    chromosome: string,
    cnvType: string,
    toolBpGroups: BpGroup[]
  ): Promise<CnvGroupDto> => {
    console.log('-- annotateMergedBpGroup');
    const mergedBps: MergedBasepairDto[] = mergedBasepairModel.mergeBpGroups(
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
}

export const analysisModel = new AnalysisModel();
