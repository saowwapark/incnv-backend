import { reformatCnvToolResultDao } from './../databases/incnv/dao/reformat-cnv-tool-result.dao';
import express from 'express';

export class ReformatCnvToolResultController {
  public getReformatCnvToolResults = async (req: express.Request, res) => {
    const uploadCnvToolResultId = +req.params.uploadCnvToolResultId;
    const reformatCnvToolResults = await reformatCnvToolResultDao.getReformatCnvToolResults(
      uploadCnvToolResultId
    );
    res.status(200).json({
      payload: reformatCnvToolResults
    });
  };
}

export const reformatCnvToolResultController = new ReformatCnvToolResultController();
