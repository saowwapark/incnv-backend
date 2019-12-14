import express from 'express';
import { analysisController } from '../controllers/analysis.controller';
const router = express.Router();
router
  .get('/sampleset', analysisController.getSamplesets)
  .get('/upload-cnv-tool-result', analysisController.getUploadCnvToolResults);

export default router;
