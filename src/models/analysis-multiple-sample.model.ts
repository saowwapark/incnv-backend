import { RegionBpDto } from '../dto/basepair.dto';

import { reformatCnvToolResultDao } from '../databases/incnv/dao/reformat-cnv-tool-result.dao';
import { UploadCnvToolResultDto } from '../databases/incnv/dto/upload-cnv-tool-result.dto';
import { MergedBasepairDto } from '../dto/analysis/merged-basepair.dto';
import { analysisModel } from './analysis.model';
/**
 * Multiple samples in one CNV tool result
 */

class CnvToolBasepair {
  basepairs?: RegionBpDto[];
  cnvTool?: string;
}
class SampleBasepair {
  basepairs?: RegionBpDto[];
  sample?: string;
  constructor(sample?, basepairs?) {
    this.sample = sample || '';
    this.basepairs = basepairs || [];
  }
}
export class AnalysisMultipleSampleModel {
  public annotateMultipleSamples = async => {};
  public getSampleBpList = async (
    uploadCnvToolResultId: number,
    samples: string[],
    cnvType,
    chromosome
  ) => {
    const sampleBpList: SampleBasepair[] = [];
    for (const sample of samples) {
      let bps: RegionBpDto[] = await reformatCnvToolResultDao.getBasepairs(
        uploadCnvToolResultId,
        sample,
        cnvType,
        chromosome
      );
      sampleBpList.push(new SampleBasepair(sample, bps));
    }
    return sampleBpList;
  };

  /**
   *  Get Merged Bps of multiple tools
   */
  public mergeSampleBps = async (
    sampleBps: SampleBasepair[]
  ): Promise<MergedBasepairDto[]> => {
    let mergedBps: MergedBasepairDto[] = [];
    for (const sampleBp of sampleBps) {
      mergedBps = analysisModel.mergeBps(
        mergedBps,
        sampleBp.basepairs!,
        sampleBp.sample
      );
    }
    return mergedBps;
  };
}
export const analysisMultipleSampleModel = new AnalysisMultipleSampleModel();
