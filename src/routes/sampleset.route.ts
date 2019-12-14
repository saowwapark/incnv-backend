import express from 'express';
import { samplesetController } from '../controllers/sampleset.controller';
import { AuthenMiddleware } from '../middleware/authen.middleware';

const router = express.Router();

router
  .get('', samplesetController.getSamplesets)

  .post('', samplesetController.addSampleset)

  .put('/:samplesetId', samplesetController.editSampleset)

  .delete('/:samplesetId', samplesetController.deleteSampleset)

  .get('/id-name', samplesetController.getIdAndName)

  .get('/count-samplesets', samplesetController.countSampleset)

  .get('/find-samplesets', samplesetController.findSamplesets);

export default router;
