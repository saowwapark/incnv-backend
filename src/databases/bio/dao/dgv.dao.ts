import { RegionBpDto } from './../../../dto/basepair.dto';
import * as mysql from 'mysql2/promise';
import { bioGrch37Pool, bioGrch38Pool } from '../../../configs/database';
import { DgvAnnotationDto } from '../dto/dgv-annotation.dto';

export class DgvDao {
  pool: mysql.Pool;

  constructor(referenceGenome) {
    if (referenceGenome === 'grch37') {
      this.pool = bioGrch37Pool;
    } else if (referenceGenome === 'grch38') {
      this.pool = bioGrch38Pool;
    } else {
      throw new Error(`Reference genome is incorrect.`);
    }
  }

  public getVariantAccession = async (
    cnvType: string,
    chromosome: string,
    startBp: number,
    endBp: number
  ): Promise<DgvAnnotationDto[]> => {
    let variantSubtype: string[];

    if (cnvType === 'duplication') {
      variantSubtype = ['gain', 'gain+loss', 'duplication'];
    } else if (cnvType === 'deletion') {
      variantSubtype = ['loss', 'gain+loss', 'deletion'];
    } else {
      throw new Error('Cnv Type is incorrect.');
    }
    const statement = `SELECT variant_accession, start_bp, end_bp FROM dgv
                  WHERE chromosome = ? AND variant_subtype in (?)
                    AND (start_bp BETWEEN ? AND ? OR end_bp BETWEEN ? AND ?)
                  ORDER BY start_bp, end_bp`;
    const data = [chromosome, variantSubtype, startBp, endBp, startBp, endBp];

    const sql = mysql.format(statement, data);
    console.log(sql);
    const [rows] = await this.pool.query<mysql.RowDataPacket[]>(sql);
    const variantAccessions: DgvAnnotationDto[] = [];
    rows.forEach(row => {
      const variant = row.variant_accession;
      const basepair = new RegionBpDto(row.start_bp, row.end_bp);
      variantAccessions.push(new DgvAnnotationDto(variant, basepair));
    });
    return variantAccessions;
  };
}
