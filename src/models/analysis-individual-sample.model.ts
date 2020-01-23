/**
 * Shared individual sample from multiple CNV tool results
 */
import { analysisModel } from './analysis.model';
import { RegionBpDto } from '../dto/basepair.dto';

import { reformatCnvToolResultDao } from '../databases/incnv/dao/reformat-cnv-tool-result.dao';
import { UploadCnvToolResultDto } from '../databases/incnv/dto/upload-cnv-tool-result.dto';
import { CnvGroupDto } from '../dto/analysis/cnv-group.dto';
import { MergedBasepairDto } from '../dto/analysis/merged-basepair.dto';

const MERGE_TOOL_IDENTITY = 'merged tools';
const FINAL_RESULT_IDENTITY = 'final result';

export class AnalysisIndividualSampleModel {
  constructor() {}

  /**
   *  Annotate Multiple Tools
   */
  public annotateMultipleTools = async (
    referenceGenome,
    chromosome,
    cnvType,
    sample,
    uploadCnvToolResults: UploadCnvToolResultDto[]
  ): Promise<CnvGroupDto[]> => {
    const annotatedTools: any[] = [];
    for (const uploadCnvToolResult of uploadCnvToolResults) {
      const regionBps = await analysisModel.getBpFromCnvResult(
        uploadCnvToolResult.uploadCnvToolResultId!,
        chromosome,
        cnvType,
        sample
      );
      const toolAnnotation = await analysisModel.generateCnvInfos(
        referenceGenome,
        chromosome,
        cnvType,
        regionBps
      );
      const annotatedTool: CnvGroupDto = {
        cnvGroupName: `${uploadCnvToolResult.cnvToolName}_${uploadCnvToolResult.fileInfo}`,
        cnvInfos: toolAnnotation
      };
      annotatedTools.push(annotatedTool);
    }
    console.log(annotatedTools);

    return annotatedTools;
  };

  /**
   * Annotate Merged Tools
   */
  public annotateMergedTools = async (
    referenceGenome,
    chromosome,
    cnvType,
    sample,
    uploadCnvToolResults: UploadCnvToolResultDto[]
  ): Promise<CnvGroupDto> => {
    const mergedBps: MergedBasepairDto[] = await this.mergeToolBps(
      chromosome,
      cnvType,
      sample,
      uploadCnvToolResults
    );
    const cnvAnnotations = await analysisModel.generateCnvInfos(
      referenceGenome,
      chromosome,
      cnvType,
      mergedBps
    );
    return new CnvGroupDto(MERGE_TOOL_IDENTITY, cnvAnnotations);
  };

  private mergeToolBps = async (
    chromosome,
    cnvType,
    sample,
    tools: UploadCnvToolResultDto[]
  ): Promise<MergedBasepairDto[]> => {
    let mergedCnvToolBps: MergedBasepairDto[] = [];

    // each tool
    for (let toolIndex = 0; toolIndex < tools.length; toolIndex++) {
      const tool = tools[toolIndex];
      const cnvToolId = this.generateCnvToolId(tool.cnvToolName, tool.fileInfo);

      let cnvToolBps: RegionBpDto[] = await reformatCnvToolResultDao.getBasepairs(
        tool.uploadCnvToolResultId,
        sample,
        cnvType,
        chromosome
      );
      mergedCnvToolBps = analysisModel.mergeBps(
        mergedCnvToolBps,
        cnvToolBps,
        cnvToolId
      );
    }
    console.log(mergedCnvToolBps);
    return mergedCnvToolBps;
  };

  /**
   *  Get Merged Bps of multiple tools
   */
  // private mergeToolBps = async (
  //   chromosome,
  //   cnvType,
  //   sample,
  //   tools: UploadCnvToolResultDto[]
  // ): Promise<MergedBasepairDto[]> => {
  //   let mergedCnvToolBps: MergedBasepairDto[] = [];

  //   // each tool
  //   for (let toolIndex = 0; toolIndex < tools.length; toolIndex++) {
  //     const tool = tools[toolIndex];
  //     const cnvToolId = this.generateCnvToolId(tool.cnvToolName, tool.fileInfo);

  //     let cnvToolBps: RegionBpDto[] = await reformatCnvToolResultDao.getBasepairs(
  //       tool.uploadCnvToolResultId,
  //       sample,
  //       cnvType,
  //       chromosome
  //     );

  //     // First cnv tool
  //     // -- initialize first mergedCnvToolBps and go to next iteration
  //     if (toolIndex === 0) {
  //       for (const cnvToolBp of cnvToolBps) {
  //         const mergedCnvToolBp = new MergedBasepairDto(
  //           cnvToolBp.startBp,
  //           cnvToolBp.endBp,
  //           [cnvToolId]
  //         );
  //         mergedCnvToolBps.push(mergedCnvToolBp);
  //       }
  //       continue;
  //     }

  //     // Second cnv tool to last
  //     else {
  //       // each old-merged basepair compare to current cnv tool
  //       let mIndex = 0;
  //       while (mIndex < mergedCnvToolBps.length) {
  //         let mergedBp = mergedCnvToolBps[mIndex];
  //         let newCnvToolBps = [...cnvToolBps];
  //         let newMergedBps: MergedBasepairDto[] = [];
  //         // each new tool's basepair
  //         for (const currentToolBp of cnvToolBps) {
  //           // ignore cnvToolBp on right side of mergedBp
  //           if (currentToolBp.startBp - mergedBp.endBp > 0) break;

  //           // overlap
  //           if (currentToolBp.endBp - mergedBp.startBp >= 0) {
  //             const diffEnd = currentToolBp.endBp - mergedBp.endBp;
  //             if (diffEnd <= 0) {
  //               const results = analysisModel.getOverlapNotOverMergedBp(
  //                 mergedBp,
  //                 currentToolBp,
  //                 cnvToolId
  //               );
  //               if (results) {
  //                 // remove used cnvToolBp
  //                 newCnvToolBps.splice(newCnvToolBps.indexOf(currentToolBp), 1);

  //                 newMergedBps = newMergedBps.concat(results);
  //                 mergedBp.startBp = currentToolBp.endBp + 1;
  //               }
  //             } else {
  //               const results = analysisModel.getOverlapOverMergedBp(
  //                 mergedBp,
  //                 currentToolBp,
  //                 cnvToolId
  //               );
  //               if (results) {
  //                 // change cnvToolBp used
  //                 const newIndex = newCnvToolBps.indexOf(currentToolBp);
  //                 newCnvToolBps[newIndex].startBp = mergedBp.endBp + 1;

  //                 newMergedBps = results;
  //               }
  //             }
  //           }
  //           // not overlap
  //           else {
  //             const result = new MergedBasepairDto(
  //               currentToolBp.startBp,
  //               currentToolBp.endBp,
  //               [cnvToolId]
  //             );
  //             // remove used cnvToolBp
  //             newCnvToolBps.splice(newCnvToolBps.indexOf(currentToolBp), 1);

  //             newMergedBps.push(result);
  //           }
  //         }
  //         cnvToolBps = newCnvToolBps;

  //         if (newMergedBps.length > 0) {
  //           // remove changed merged bp
  //           mergedCnvToolBps.splice(mIndex, 1);

  //           // insert merged bp instead of removed bp
  //           mergedCnvToolBps.splice(mIndex, 0, ...newMergedBps);

  //           // update merged index
  //           mIndex = mIndex + newMergedBps.length;
  //         } else {
  //           mIndex++;
  //         }
  //       }
  //     }
  //   }
  //   return mergedCnvToolBps;

  // };

  private generateCnvToolId(cnvToolName, cnvParam) {
    return `${cnvToolName}_${cnvParam}`;
  }
}

export const analysisIndividualSampleModel = new AnalysisIndividualSampleModel();
