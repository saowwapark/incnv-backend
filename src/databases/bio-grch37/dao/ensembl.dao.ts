import * as mysql from 'mysql2/promise';
import { bioGrch37Pool, bioGrch38Pool } from '../../../configs/database';

export class EnsemblDao {
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

  public getGeneId = async (
    chromosome: string,
    startBp: number,
    endBp: number
  ): Promise<string[]> => {
    const statement = `SELECT gene_id FROM ensembl
                  WHERE chromosome = ?
                    AND (start_bp BETWEEN ? AND ? OR end_bp BETWEEN ? AND ?)
                  ORDER BY start_bp, end_bp`;
    const data = [chromosome, startBp, endBp, startBp, endBp];

    const sql = mysql.format(statement, data);
    console.log(sql);
    const [rows] = await this.pool.query<mysql.RowDataPacket[]>(sql);
    const geneIds: string[] = [];
    rows.forEach(row => {
      const geneId = row.gene_id;
      geneIds.push(geneId);
    });
    return geneIds;
  };
}
