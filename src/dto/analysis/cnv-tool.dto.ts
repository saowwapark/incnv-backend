import { CnvInfoDto } from './cnv-info.dto';

export class CnvToolDto {
  cnvToolId?: string; // cnv tool name or sample name.
  cnvInfos?: CnvInfoDto[]; // annotation for a given cnv tool.

  constructor(cnvToolId?, cnvInfos?) {
    if (cnvToolId) {
      this.cnvToolId = cnvToolId;
      this.cnvInfos = cnvInfos;
    }
  }
}
