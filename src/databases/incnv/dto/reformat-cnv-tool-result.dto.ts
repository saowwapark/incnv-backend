export class ReformatCnvToolResultDto {
  reformatCnvToolResultId?: number;
  uploadCnvToolResultId?: number;
  sample?: string;
  chromosome?: string;
  startBasepair?: number;
  endBasepair?: number;
  cnvType?: string;

  constructor(a?) {
    if (a) {
      this.reformatCnvToolResultId = a.reformatCnvToolResultId;
      this.uploadCnvToolResultId = a.uploadCnvToolResultId;
      this.sample = a.sample;
      this.chromosome = a.chromosome;
      this.startBasepair = a.startBasepair;
      this.endBasepair = a.endBasepair;
      this.cnvType = a.cnvType;
    }
  }
}
