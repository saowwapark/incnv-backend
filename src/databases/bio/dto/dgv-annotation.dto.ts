import { RegionBpDto } from './../../../dto/basepair.dto';
export class DgvAnnotationDto {
  variantAccession?: number;

  basepair?: RegionBpDto;

  constructor(variantAccession?, basepair?) {
    this.variantAccession = variantAccession || undefined;
    this.basepair = basepair || {};
  }
}
