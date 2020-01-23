export class EnsemblAnnotationDto {
  geneId?: string;
  geneSymbol?: string;

  constructor(geneId?, geneSymbol?) {
    this.geneId = geneId || '';
    this.geneSymbol = geneSymbol || '';
  }
}
