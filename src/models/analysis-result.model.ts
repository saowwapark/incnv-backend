import { ClinvarAnnotationListDto } from './../dto/analysis/clinvar-annotation-list.dto';
import { CnvInfoDto } from '../dto/analysis/cnv-info.dto';
import { DgvAnnotationDto } from '../databases/bio/dto/dgv-annotation.dto';

export class AnalysisResultModel {
  createDataFile = (cnvInfos: CnvInfoDto[]) => {
    let result = '';
    const header =
      '#chromosome\tstart_bp\tend_bp\tcnv_type\tensembl\tdgv\tclinvar_omim\tclinvar_phenotype\tclinvar_clinical_significance';
    result += `${header}\n`;
    for (const cnvInfo of cnvInfos) {
      result += `${cnvInfo.chromosome}\t`;
      result += `${cnvInfo.startBp}\t`;
      result += `${cnvInfo.endBp}\t`;
      result += `${cnvInfo.cnvType}\t`;
      const ensembls = cnvInfo.ensembls;
      // const dgvs: DgvAnnotationDto[] = cnvInfo.dgvs!;
      const clinvar: ClinvarAnnotationListDto = cnvInfo.clinvar!;
      if (!ensembls || ensembls.length === 0) {
        result += `\t\t`;
      } else if (ensembls.length > 0) {
        for (let index = 0; index < ensembls.length; index++) {
          const ensembl = ensembls[index];
          // last
          if (index === ensembls.length - 1) {
            result += `${ensembl.geneId}:${ensembl.geneSymbol}`;
          } else {
            // general
            result += `${ensembl.geneId}:${ensembl.geneSymbol};`;
          }
        }
        result += `\t`;
      }

      // if (!dgvs || dgvs.length === 0) {
      //   result += `\t\t`;
      // } else if (dgvs.length > 0) {
      //   for (let index = 0; index < dgvs.length; index++) {
      //     const dgv = dgvs[index];
      //     // last
      //     if (index === dgvs.length - 1) {
      //       result += `${dgv.variantAccession}`;
      //     } else {
      //       // general
      //       result += `${dgv.variantAccession};`;
      //     }
      //   }
      //   result += `\t`;
      // }

      if (!clinvar) {
        result += `\t\t\t\t\t\t`;
      } else {
        const omimIds = clinvar.omimIds;
        if (!omimIds || omimIds.length === 0) {
          result += `\t\t`;
        } else {
          for (let index = 0; index < omimIds.length; index++) {
            const omimId = omimIds[index];
            // last
            if (index === omimIds.length - 1) {
              result += `${omimId}`;
            } else {
              // general
              result += `${omimId};`;
            }
          }
          result += `\t`;
        }

        const phenotypes = clinvar.phenotypes;

        if (!phenotypes || phenotypes.length === 0) {
          result += `\t\t`;
        } else {
          for (let index = 0; index < phenotypes.length; index++) {
            const phenotype = phenotypes[index];
            // last
            if (index === phenotypes.length - 1) {
              result += `${phenotype}`;
            } else {
              // general
              result += `${phenotype};`;
            }
          }
          result += `\t`;
        }

        const clinicalSignificances = clinvar.clinicalSignificances;
        if (!clinicalSignificances || clinicalSignificances.length === 0) {
          result += `\t\t`;
        } else {
          for (let index = 0; index < clinicalSignificances.length; index++) {
            const clinicalSignificance = clinicalSignificances[index];
            // last
            if (index === clinicalSignificances.length - 1) {
              result += `${clinicalSignificance}`;
            } else {
              // general
              result += `${clinicalSignificance};`;
            }
          }
          result += `\t`;
        }
      }

      result += `\n`;
    }
    return result;
  };
}

export const analysisResultModel = new AnalysisResultModel();
