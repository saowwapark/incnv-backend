import { samplesetDao } from '../databases/incnv/dao/sampleset.dao';
import { uploadCnvToolResultDao } from '../databases/incnv/dao/upload-cnv-tool-result.dao';
export class AnalysisModel {
  public getSamplesetsToChoose = async (userId: number) => {
    return await samplesetDao.getSamplesetsToChoose(userId);
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
}

export const analysisModel = new AnalysisModel();
