import { AuthenMiddleware } from '../middleware/authen.middleware';
import express from 'express';

import userRoutes from './user.route';
import uploadRoutes from './upload-cnv-tool-result.route';
import reformatRoutes from './reformat-cnv-tool-result.route';
import samplesetRoutes from './sampleset.route';
import tabFileMappingRoutes from './tab-file-mapping.route';
import analysisRoutes from './analysis.route';

export default function(app: express.Application) {
  app.use('/api/user', userRoutes);
  app.use('/api/upload-cnv-tool-result', uploadRoutes);
  app.use('/api/reformat-cnv-tool-result', reformatRoutes);
  // app.use('/api/sampleset', [AuthenMiddleware.checkAuth], samplesetRoutes);
  app.use('/api/sampleset', samplesetRoutes);
  app.use(
    '/api/tab-file-mapping',
    //  [AuthenMiddleware.checkAuth],
    tabFileMappingRoutes
  );
  app.use('/api/analysis', analysisRoutes);
}
