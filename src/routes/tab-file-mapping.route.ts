import express from 'express';
import { tabFileMappingController } from '../controllers/tab-file-mapping.controller';

const router = express.Router();

router.get('/id-names', tabFileMappingController.getIdAndName);

router
  .get('', tabFileMappingController.getTabFileMappings)

  .post('', tabFileMappingController.addTabFileMapping)

  .put('/:tabFileMappingId', tabFileMappingController.editTabFileMapping)

  .delete('/:tabFileMappingId', tabFileMappingController.deleteTabFileMapping);

export default router;
