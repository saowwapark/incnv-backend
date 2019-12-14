import { UploadMiddleware } from './../middleware/upload.middleware';
import { UploadCnvToolResultModel } from './../models/upload-cnv-tool-result.model';
import { uploadCnvToolResultController } from '../controllers/upload-cnv-tool-result.controller';
// import uploadFile from '../middleware/upload-file';
import express from 'express';
import multer from 'multer';

const router = express.Router();

router
  // .post(
  //   '',
  //   UploadCnvToolResultModel.uploadFile,
  //   UploadCnvToolResultController.addUploadCnvToolResult
  // )

  .post(
    '',
    UploadMiddleware.uploadFile,
    uploadCnvToolResultController.addUploadCnvToolResult
  )
  // must to remove lataer get('', uploadCnvToolResultController.getUploadCnvToolResultViews);
  .get('', uploadCnvToolResultController.getUploadCnvToolResultViews)
  .delete(
    '/:uploadCnvToolResultId',
    uploadCnvToolResultController.deleteUploadCnvToolResult
  );

export default router;
