import { reformatCnvToolResultController } from './../controllers/reformat-cnv-tool-result.controller';
import express from 'express';
const router = express.Router();

router.get(
  '/:uploadCnvToolResultId',
  reformatCnvToolResultController.getReformatCnvToolResults
);

export default router;
