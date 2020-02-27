import { reformatCnvToolResultController } from './../controllers/reformat-cnv-tool-result.controller';
import express from 'express';
const router = express.Router();

router
  .get(
    '/upload-cnv-tool-results/:uploadCnvToolResultId',
    reformatCnvToolResultController.getPagingResults
  )
  .put(
    '/:reformatCnvToolResultId',
    reformatCnvToolResultController.editReformatCnvToolResult
  )
  .post('', reformatCnvToolResultController.addReformatCnvToolResult)
  .get(
    '/upload-cnv-tool-results/:uploadCnvToolResultId',
    reformatCnvToolResultController.getPagingResults
  )
  .delete(
    '/single-upload-cnv-tool-result',
    reformatCnvToolResultController.deleteReformatByUploadId
  )
  .delete(
    '/multiple-upload-cnv-tool-result',
    reformatCnvToolResultController.deleteReformatCnvToolResults
  );

export default router;
