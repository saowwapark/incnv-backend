import { reformatCnvToolResultDao } from './../databases/incnv/dao/reformat-cnv-tool-result.dao';
import express from 'express';

export class ReformatCnvToolResultController {
  public getPagingResults = async (req: express.Request, res) => {
    const uploadCnvToolResultId = +req.params.uploadCnvToolResultId;
    const sort = req.query.sort;
    const order = req.query.order;
    const pageNumber = req.query.pageNumber;
    const pageSize = req.query.pageSize;
    const reformatCnvToolResults = await reformatCnvToolResultDao.getPagingResults(
      uploadCnvToolResultId,
      sort,
      order,
      +pageNumber,
      +pageSize
    );
    const totalCount = await reformatCnvToolResultDao.getTotalCount(
      uploadCnvToolResultId
    );
    res.status(200).json({
      payload: { items: reformatCnvToolResults, totalCount: totalCount }
    });
  };

  public deleteReformatByUploadId = async (req, res) => {
    const uploadCnvToolResultId = req.query.uploadCnvToolResultId;
    await reformatCnvToolResultDao.deleteReformatByUploadId(
      +uploadCnvToolResultId
    );
    res.status(200).end();
  };
  public deleteReformatCnvToolResults = async (req: express.Request, res) => {
    const reformatIds = req.body.reformatCnvToolResultIds;

    await reformatCnvToolResultDao.deleteReformatCnvToolResults(reformatIds);

    res.status(200).end();
  };

  public editReformatCnvToolResult = async (req: express.Request, res) => {
    const reformatCnvToolResult = req.body.reformatCnvToolResult;
    await reformatCnvToolResultDao.editReformatCnvToolResult(
      reformatCnvToolResult
    );
    res.status(200).end();
  };
}

export const reformatCnvToolResultController = new ReformatCnvToolResultController();
