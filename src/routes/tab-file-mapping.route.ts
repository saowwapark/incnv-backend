import express from 'express';
import { tabFileMappingController } from '../controllers/tab-file-mapping.controller';

const router = express.Router();

router.get('/id-name', tabFileMappingController.getIdAndName);

router
  .get('/get-mappings', tabFileMappingController.getTabFileMappings)

  .post('', tabFileMappingController.addTabFileMapping)

  .put('/:tabFileMappingId', tabFileMappingController.editTabFileMapping)

  .delete('/:tabFileMappingId', tabFileMappingController.deleteTabFileMapping);

export default router;
