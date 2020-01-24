import { RegionBpDto } from './../../../dto/basepair.dto';
export class EnsemblAnnotationDto {
  geneId?: string;
  geneSymbol?: string;
  basepair?: RegionBpDto;

  constructor(geneId?, geneSymbol?, basepair?) {
    this.geneId = geneId || '';
    this.geneSymbol = geneSymbol || '';
    this.basepair = basepair || {};
  }
}
