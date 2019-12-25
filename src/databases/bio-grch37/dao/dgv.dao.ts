import * as mysql from 'mysql2/promise';
import { bioGrch37Pool, bioGrch38Pool } from '../../../configs/database';

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
    startBasepair: number,
    endBasepair: number
  ): Promise<string[]> => {
    let variantSubtype: string;

    if (cnvType === 'duplication') {
      variantSubtype = `'gain', 'gain+loss', 'duplication`;
    } else if (cnvType === 'deletion') {
      variantSubtype = `'loss', 'gain+loss', 'deletion'`;
    } else {
      throw new Error('Cnv Type is incorrect.');
    }
    const statement = `SELECT variant_accession FROM dgv
                  WHERE chromosome = ? AND variant_subtype in (?)
                    AND
                    start_basepair BETWEEN ? AND ?
                    OR
                    end_basepair BETWEEN ? AND ?
                  ORDER BY start_basepair, end_basepair`;
    const data = [
      chromosome,
      variantSubtype,
      startBasepair,
      endBasepair,
      startBasepair,
      endBasepair
    ];

    const sql = mysql.format(statement, data);
    console.log(sql);
    const [rows] = await this.pool.query<mysql.RowDataPacket[]>(sql);
    const variantAccessions: string[] = [];
    rows.forEach(row => {
      const variant = row.variant_accession;
      variantAccessions.push(variant);
    });
    return variantAccessions;
  };
}
