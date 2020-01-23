import express from 'express';
import { analysisController } from '../controllers/analysis.controller';
const router = express.Router();
router
  .get('/samplesets', analysisController.getSamplesetsToAnalyze)
  .get('/upload-cnv-tool-results', analysisController.getUploadCnvToolResults)
  .get('/individual-sample', analysisController.getIndividualSample)
  .get('/multiple-sample', analysisController.getMultipleSample)
  .post('/cnv-infos', analysisController.updateCnvInfos)
  .post('/cnv-info', analysisController.updateCnvInfo)
  .post('/download/cnv-infos', analysisController.exportCnvInfos);

export default router;
