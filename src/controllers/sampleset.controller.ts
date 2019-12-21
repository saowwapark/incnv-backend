import { samplesetModel } from './../models/sampleset.model';
import { samplesetDao } from '../databases/incnv/dao/sampleset.dao';
import express from 'express';
import { userService } from '../services/user.service';

export class SamplesetController {
  public getIdAndName = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    const userId = userService.getUserId(req);

    try {
      const idAndNames = await samplesetDao.getIdAndNames(userId);
      res.status(200).json({
        payload: idAndNames
      });
    } catch (err) {
      next(err);
    }
  };

  public countSampleset = async (req, res) => {
    const totalSampleset = await samplesetDao.countSampleset(req);
    res.status(200).json({
      payload: totalSampleset
    });
  };

  /**
   * Find samplesets per page
   */
  public findSamplesets = async (req, res) => {
    const samplesets = await samplesetDao.findSampleset(req);
    res.status(200).json({
      payload: samplesets
    });
  };

  public addSampleset = async (req, res) => {
    await samplesetDao.addSampleset(req);
    res.status(200).end();
  };

  public editSampleset = async (req, res) => {
    await samplesetDao.editSampleset(req);
    res.status(200).end();
  };

  public deleteSamplesets = async (req: express.Request, res) => {
    const samplesetIds = req.body.samplesetIds;
    console.log(samplesetIds);
    await samplesetDao.deleteSamplesets(samplesetIds);
    res.status(200).end();
  };

  public getSamplesets = async (
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    try {
      const userId = userService.getUserId(req);
      const uploadCnvToolResults = await samplesetModel.getSamplesets(userId!);
      res.status(200).json({ payload: uploadCnvToolResults });
    } catch (err) {
      next(err);
    }
  };
}

export const samplesetController = new SamplesetController();
