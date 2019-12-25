import { reformatCnvToolResultController } from './../controllers/reformat-cnv-tool-result.controller';
import express from 'express';
const router = express.Router();

router
  .put(
    '/:reformatCnvToolResultId',
    reformatCnvToolResultController.editReformatCnvToolResult
  )
  .delete('', reformatCnvToolResultController.deleteReformatCnvToolResults)
  .get(
    '/upload-cnv-tool-results/:uploadCnvToolResultId',
    reformatCnvToolResultController.getPagingResults
  )
  .delete(
    '/upload-cnv-tool-results/:uploadCnvToolResultId',
    reformatCnvToolResultController.deleteReformatByUploadId
  );

export default router;
