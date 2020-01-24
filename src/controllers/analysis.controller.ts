import { analysisIndividualSampleModel } from '../models/analysis-individual-sample.model';
import { analysisModel } from './../models/analysis.model';
import { userService } from '../services/user.service';
import * as express from 'express';
import { analysisResultModel } from '../models/analysis-result.model';
import { CnvInfoDto } from '../dto/analysis/cnv-info.dto';
import { analysisMultipleSampleModel } from '../models/analysis-multiple-sample.model';

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
    try {
      const referenceGenome = req.query.referenceGenome;
      const cnvType = req.query.cnvType;
      const chromosome = req.query.chromosome;
      const uploadCnvToolResult = JSON.parse(req.query.uploadCnvToolResult);
      const samples = JSON.parse(req.query.samples);

      const [
        annotatedSelectedSamples,
        annotatedMergedSample
      ] = await analysisMultipleSampleModel.annotate(
        referenceGenome,
        chromosome,
        cnvType,
        samples,
        uploadCnvToolResult
      );

      res.status(200).json({
        payload: [annotatedSelectedSamples, annotatedMergedSample]
      });
    } catch (err) {
      next(err);
    }
  };

  public getIndividualSample = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const referenceGenome = req.query.referenceGenome;
      const cnvType = req.query.cnvType;
      const chromosome = req.query.chromosome;
      const uploadCnvToolResults = JSON.parse(req.query.uploadCnvToolResults);
      const sample = req.query.sample;

      const [
        annotatedSelectedCnvTools,
        annotatedMergedCnvTool
      ] = await analysisIndividualSampleModel.annotate(
        referenceGenome,
        chromosome,
        cnvType,
        sample,
        uploadCnvToolResults
      );

      res.status(200).json({
        payload: [annotatedSelectedCnvTools, annotatedMergedCnvTool]
      });
    } catch (err) {
      next(err);
    }
  };

  public getCnvInfos = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
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
    } catch (err) {
      next(err);
    }
  };

  public getCnvInfo = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const cnvInfo: CnvInfoDto = req.body;

      const updatedCnvInfo = await analysisModel.updateCnvInfo(cnvInfo);

      res.status(200).json({
        payload: updatedCnvInfo
      });
    } catch (err) {
      next(err);
    }
  };

  public exportCnvInfos = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const cnvInfos: CnvInfoDto[] = req.body;

      const dataFile = await analysisResultModel.createDataFile(cnvInfos);
      console.log(dataFile);
      res.contentType('text/plain');
      res.set({ 'Content-Disposition': 'attachment; filename=name.txt' });
      res.send(dataFile);
    } catch (err) {
      next(err);
    }
  };
}

export const analysisController = new AnalysisController();
