import { RegionBpDto } from './../../../dto/basepair.dto';
export class DgvAnnotationDto {
  variantAccession?: number;
  startBp?: number;
  endBp?: number;

  constructor(variantAccession?, startBp?, endBp?) {
    this.variantAccession = variantAccession || undefined;
    this.startBp = startBp || undefined;
    this.endBp = endBp || undefined;
  }
}
