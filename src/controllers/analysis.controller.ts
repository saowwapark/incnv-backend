import { analysisModel } from './../models/analysis.model';
import { userService } from '../services/user.service';
import * as express from 'express';

export class AnalysisController {
  public getSamplesets = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const userId = userService.getUserId(req);
      const samplesets = await analysisModel.getSamplesetsToChoose(userId!);
      res.status(200).json({
        payload: samplesets
      });
    } catch (err) {
      next(err);
    }
  };

  public getUploadCnvToolResults = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const referenceGenome = req.params.referenceGenome,
        samplesetId = req.params.samplesetId;

      const uploadCnvToolResults = await analysisModel.getUploadCnvToolResultToChoose(
        referenceGenome,
        samplesetId
      );
      res.status(200).json({
        payload: uploadCnvToolResults
      });
    } catch (err) {
      next(err);
    }
  };
}

export const analysisController = new AnalysisController();
