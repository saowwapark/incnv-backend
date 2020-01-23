import { EnsemblAnnotationDto } from './../../databases/bio/dto/ensembl-annotation.dto';
import { ClinvarAnnotationListDto } from './clinvar-annotation-list.dto';

export class CnvInfoDto {
  referenceGenome?: string;
  chromosome?: string;
  cnvType?: string;
  startBp?: number;
  endBp?: number;
  overlaps?: string[];
  dgvs?: string[]; //dgv.variant_accession
  ensembls?: EnsemblAnnotationDto[]; //ensembl.gene_id
  clinvar?: ClinvarAnnotationListDto;
}
