import { analysisIndividualSampleModel } from '../models/analysis-individual-sample.model';
import { analysisModel } from './../models/analysis.model';
import { userService } from '../services/user.service';
import * as express from 'express';
import { analysisResultModel } from '../models/analysis-result.model';
import { CnvInfoDto } from '../dto/analysis/cnv-info.dto';

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

  public getMultipleSample = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const referenceGenome = req.query.referenceGenome;
    const cnvType = req.query.cnvType;
    const chromosome = req.query.chromosome;
    const uploadCnvToolResult = JSON.parse(req.query.uploadCnvToolResult);
    const samples = req.query.samples;
  };

  public getIndividualSample = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const referenceGenome = req.query.referenceGenome;
    const cnvType = req.query.cnvType;
    const chromosome = req.query.chromosome;
    const uploadCnvToolResults = JSON.parse(req.query.uploadCnvToolResults);
    const sample = req.query.sample;

    const selectedCnvTools = await analysisIndividualSampleModel.annotateMultipleTools(
      referenceGenome,
      chromosome,
      cnvType,
      sample,
      uploadCnvToolResults
    );

    const mergedCnvTool = await analysisIndividualSampleModel.annotateMergedTools(
      referenceGenome,
      chromosome,
      cnvType,
      sample,
      uploadCnvToolResults
    );

    res.status(200).json({
      payload: [selectedCnvTools, mergedCnvTool]
    });
  };

  public getCnvInfos = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    // // for http.get
    // const cnvs: CnvFragmentAnnotationDto[] = JSON.parse(req.query.data);

    // for http.ppost
    const cnvInfos: CnvInfoDto[] = req.body;
    console.log(cnvInfos);
    const updatedCnvInfos: CnvInfoDto[] = [];
    for (const cnvInfo of cnvInfos) {
      const updatedCnvInfo = await analysisModel.updateCnvInfo(cnvInfo);
      updatedCnvInfos.push(updatedCnvInfo);
    }
    res.status(200).json({
      payload: updatedCnvInfos
    });
  };

  public getCnvInfo = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const cnvInfo: CnvInfoDto = req.body;

    const updatedCnvInfo = await analysisModel.updateCnvInfo(cnvInfo);

    res.status(200).json({
      payload: updatedCnvInfo
    });
  };

  public exportCnvInfos = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const cnvInfos: CnvInfoDto[] = req.body;

    const dataFile = await analysisResultModel.createDataFile(cnvInfos);
    console.log(dataFile);
    res.contentType('text/plain');
    res.set({ 'Content-Disposition': 'attachment; filename=name.txt' });
    res.send(dataFile);
  };
}

export const analysisController = new AnalysisController();
