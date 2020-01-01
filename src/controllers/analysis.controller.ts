import { AnalysisProcessModel } from './../models/analysis-process.model';
import { analysisModel } from './../models/analysis.model';
import { userService } from '../services/user.service';
import * as express from 'express';

export class AnalysisController {
  public getSamplesetsToAnalyze = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const userId = userService.getUserId(req);
      const samplesets = await analysisModel.getSamplesetsToAnalyze(userId!);
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
      const referenceGenome = req.query.referenceGenome,
        samplesetId = req.query.samplesetId;

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

  public getAllCnvToolDetails = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const referenceGenome = req.query.referenceGenome;
    const cnvType = req.query.cnvType;
    const chromosome = req.query.chromosome;
    const uploadCnvToolResults = JSON.parse(req.query.uploadCnvToolResults);
    const sample = req.query.sample;
    const analysisProcessModel = new AnalysisProcessModel(
      referenceGenome,
      sample,
      cnvType,
      chromosome
    );
    let allCnvToolDetails: any[] = [];
    const selectedCnvTools = await analysisProcessModel.annotateMultipleTools(
      uploadCnvToolResults
    );
    const mergedCnvTool = await analysisProcessModel.annotateMergedTools(
      uploadCnvToolResults
    );

    allCnvToolDetails = selectedCnvTools;
    allCnvToolDetails.push(mergedCnvTool);

    res.status(200).json({
      payload: allCnvToolDetails
    });
  };
}

export const analysisController = new AnalysisController();
