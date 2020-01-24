import { RegionBpDto } from '../dto/basepair.dto';

import { reformatCnvToolResultDao } from '../databases/incnv/dao/reformat-cnv-tool-result.dao';
import { UploadCnvToolResultDto } from '../databases/incnv/dto/upload-cnv-tool-result.dto';
import { analysisModel } from './analysis.model';
import { CnvGroupDto } from '../dto/analysis/cnv-group.dto';
import { BpGroup } from '../dto/analysis/bp-group';
/**
 * Multiple samples in one CNV tool result
 */

export class AnalysisMultipleSampleModel {
  public annotate = async (
    referenceGenome,
    chromosome,
    cnvType,
    samples: string[],
    uploadCnvToolResult: UploadCnvToolResultDto
  ): Promise<[CnvGroupDto[], CnvGroupDto]> => {
    const sampleBpGroups: BpGroup[] = await this.getSampleBpGroups(
      uploadCnvToolResult!.uploadCnvToolResultId!,
      samples,
      cnvType,
      chromosome
    );

    const annotatedMultipleSamples = await this.annotateMultipleSamples(
      referenceGenome,
      chromosome,
      cnvType,
      sampleBpGroups
    );
    const annotatedMergedSample = await analysisModel.annotateMergedBpGroup(
      referenceGenome,
      chromosome,
      cnvType,
      sampleBpGroups
    );
    return [annotatedMultipleSamples, annotatedMergedSample];
  };

  public annotateMultipleSamples = async (
    referenceGenome,
    chromosome,
    cnvType,
    sampleBpGroups: BpGroup[]
  ) => {
    // add annotation of all samples
    const annotatedSamples: any[] = [];
    for (const sampleBpGroup of sampleBpGroups) {
      const sampleAnnotation = await analysisModel.generateCnvInfos(
        referenceGenome,
        chromosome,
        cnvType,
        sampleBpGroup.basepairs!
      );
      const annotatedSample: CnvGroupDto = {
        cnvGroupName: sampleBpGroup.groupName,
        cnvInfos: sampleAnnotation
      };
      annotatedSamples.push(annotatedSample);
    }
    return annotatedSamples;
  };

  /**
   * get Basepairs of all samples
   */
  public getSampleBpGroups = async (
    uploadCnvToolResultId: number,
    samples: string[],
    cnvType,
    chromosome
  ): Promise<BpGroup[]> => {
    const sampleBpGroups: BpGroup[] = [];
    for (const sample of samples) {
      let bps: RegionBpDto[] = await reformatCnvToolResultDao.getBasepairs(
        uploadCnvToolResultId,
        sample,
        cnvType,
        chromosome
      );
      const sampleBpGroup: BpGroup = {
        groupName: sample,
        basepairs: bps
      };
      sampleBpGroups.push(sampleBpGroup);
    }
    return sampleBpGroups;
  };
}
export const analysisMultipleSampleModel = new AnalysisMultipleSampleModel();
