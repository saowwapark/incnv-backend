import express from 'express';
import { analysisController } from '../controllers/analysis.controller';
const router = express.Router();
router
  .get('/samplesets', analysisController.getSamplesetsToAnalyze)
  .get('/upload-cnv-tool-results', analysisController.getUploadCnvToolResults)
  .get('/all-cnv-tool-details', analysisController.getAllCnvToolDetails);

export default router;
