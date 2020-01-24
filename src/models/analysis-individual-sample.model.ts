/**
 * Shared individual sample from multiple CNV tool results
 */
import { analysisModel } from './analysis.model';

import { reformatCnvToolResultDao } from '../databases/incnv/dao/reformat-cnv-tool-result.dao';
import { UploadCnvToolResultDto } from '../databases/incnv/dto/upload-cnv-tool-result.dto';
import { CnvGroupDto } from '../dto/analysis/cnv-group.dto';
import { MergedBasepairDto } from '../dto/analysis/merged-basepair.dto';
import { BpGroup } from '../dto/analysis/bp-group';
import { CnvInfoDto } from '../dto/analysis/cnv-info.dto';
import { MERGED_RESULT_NAME } from '../dto/analysis/constants';

export class AnalysisIndividualSampleModel {
  constructor() {}

  public annotate = async (
    referenceGenome,
    chromosome,
    cnvType,
    sample: string,
    uploadCnvToolResults: UploadCnvToolResultDto[]
  ): Promise<[CnvGroupDto[], CnvGroupDto]> => {
    const toolBpGroups = await this.getToolBpGroups(
      chromosome,
      cnvType,
      sample,
      uploadCnvToolResults
    );

    const annotatedMultipleTools = await this.annotateMultipleTools(
      referenceGenome,
      chromosome,
      cnvType,
      toolBpGroups
    );
    const annotatedMergedTool = await analysisModel.annotateMergedBpGroup(
      referenceGenome,
      chromosome,
      cnvType,
      toolBpGroups
    );
    return [annotatedMultipleTools, annotatedMergedTool];
  };

  private getToolBpGroups = async (
    chromosome,
    cnvType,
    sample: string,
    uploadCnvToolResults: UploadCnvToolResultDto[]
  ) => {
    const toolBpGroups: BpGroup[] = [];
    for (const upload of uploadCnvToolResults) {
      const regionBps = await reformatCnvToolResultDao.getBasepairs(
        upload.uploadCnvToolResultId,
        sample,
        cnvType,
        chromosome
      );
      const toolBpGroup: BpGroup = {
        groupName: `${upload.cnvToolName}_${upload.fileInfo}`,
        basepairs: regionBps
      };
      toolBpGroups.push(toolBpGroup);
    }
    return toolBpGroups;
  };

  /**
   *  Annotate Multiple Tools
   */
  public annotateMultipleTools = async (
    referenceGenome,
    chromosome,
    cnvType,
    toolBpGroups: BpGroup[]
  ): Promise<CnvGroupDto[]> => {
    const annotatedTools: any[] = [];
    for (const toolBpGroup of toolBpGroups) {
      const cnvInfos: CnvInfoDto[] = await analysisModel.generateCnvInfos(
        referenceGenome,
        chromosome,
        cnvType,
        toolBpGroup.basepairs!
      );
      const annotatedTool: CnvGroupDto = {
        cnvGroupName: toolBpGroup.groupName,
        cnvInfos: cnvInfos
      };
      annotatedTools.push(annotatedTool);
    }

    return annotatedTools;
  };
}

export const analysisIndividualSampleModel = new AnalysisIndividualSampleModel();
