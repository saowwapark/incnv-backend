import { tabFileMappingDao } from '../databases/incnv/dao/tab-file-mapping.dao';
import { userService } from '../services/user.service';

export class TabFileMappingController {
  public getTabFileMapping = async (tabFileMappingId: number) => {
    const tabFileMapping = await tabFileMappingDao.getTabFileMapping(
      tabFileMappingId
    );
    return tabFileMapping;
  };

  public editTabFileMapping = async (req, res) => {
    await tabFileMappingDao.editTabFileMapping(req);
    res.status(200).end();
  };

  public addTabFileMapping = async (req, res) => {
    const tabFileMapping = await tabFileMappingDao.addTabFileMapping(req);
    res.status(200).json({
      payload: tabFileMapping
    });
  };

  public deleteTabFileMapping = async (req, res) => {
    await tabFileMappingDao.deleteTabFileMapping(req);
    res.status(200).end();
  };

  public getIdAndName = async (req, res) => {
    const userId = userService.getUserId(req);
    const idAndNames = await tabFileMappingDao.getIdAndName(userId);
    res.status(200).json({
      payload: idAndNames
    });
  };

  public getTabFileMappings = async (req, res) => {
    const tabFileMappings = await tabFileMappingDao.getTabFileMappings(req);
    res.status(200).json({
      payload: tabFileMappings
    });
  };
}

export const tabFileMappingController = new TabFileMappingController();
