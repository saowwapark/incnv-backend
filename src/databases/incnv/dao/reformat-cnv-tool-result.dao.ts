import { ReformatCnvToolResultDto } from './../dto/reformat-cnv-tool-result.dto';
import * as mysql from 'mysql2/promise';
import { inCnvPool } from '../../../configs/database';
import { BasepairDto } from '../../../dto/basepair.dto';

export class ReformatCnvToolResultDao {
  private parse(reformatDb) {
    const reformatDto = new ReformatCnvToolResultDto();
    reformatDto.reformatCnvToolResultId =
      reformatDb.reformat_cnv_tool_result_id;
    reformatDto.uploadCnvToolResultId = reformatDb.upload_cnv_tool_result_id;
    reformatDto.sample = reformatDb.sample;
    reformatDto.chromosome = reformatDb.chromosome;
    reformatDto.startBasepair = reformatDb.start_basepair;
    reformatDto.endBasepair = reformatDb.end_basepair;
    reformatDto.cnvType = reformatDb.cnv_type;
    return reformatDto;
  }
  public async addReformatCnvToolResult(
    reformatDto: ReformatCnvToolResultDto
  ): Promise<number> {
    try {
      const post = [
        reformatDto.uploadCnvToolResultId,
        reformatDto.sample,
        reformatDto.chromosome,
        reformatDto.startBasepair,
        reformatDto.endBasepair,
        reformatDto.cnvType
      ];
      const sql = mysql.format(
        `INSERT INTO reformat_cnv_tool_result (
      upload_cnv_tool_result_id, sample,
      chromosome, start_basepair, end_basepair, cnv_type
      ) VALUES (?, ?, ?, ?, ?, ?)`,
        post
      );
      // console.log(sql);
      const [resultSetHeader] = await inCnvPool.query<mysql.OkPacket>(sql);
      return resultSetHeader.insertId;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  public async addReformatCnvToolResults(
    reformatDtos: ReformatCnvToolResultDto[]
  ): Promise<number> {
    try {
      const posts: any[] = [];
      reformatDtos.forEach(reformatDto => {
        const post = [
          reformatDto.uploadCnvToolResultId,
          reformatDto.sample,
          reformatDto.chromosome,
          reformatDto.startBasepair,
          reformatDto.endBasepair,
          reformatDto.cnvType
        ];
        posts.push(post);
      });

      const sql = mysql.format(
        `INSERT INTO reformat_cnv_tool_result (
      upload_cnv_tool_result_id, sample,
      chromosome, start_basepair, end_basepair, cnv_type
      ) VALUES ?`,
        [posts]
      );
      // console.log(sql);
      const [resultSetHeader] = await inCnvPool.query<mysql.OkPacket>(sql);
      return resultSetHeader.insertId;
    } catch (err) {
      console.log(err);
      throw err;
    }
  }

  public async getTotalCount(uploadCnvToolResultId) {
    const sql = mysql.format(
      `SELECT COUNT(*) AS total_count
    FROM reformat_cnv_tool_result
    WHERE upload_cnv_tool_result_id = ?`,
      [uploadCnvToolResultId]
    );
    console.log(sql);
    const [rows] = await inCnvPool.query<mysql.RowDataPacket[]>(sql);

    return rows[0].total_count;
  }

  public async getPagingResults(
    uploadCnvToolResultId: number,
    sort: string,
    order: string,
    pageNumber: number,
    pageSize: number
  ): Promise<ReformatCnvToolResultDto[]> {
    pageNumber = pageNumber || 0;
    pageSize = pageSize;
    const initialPos = pageNumber * pageSize;
    const sql = mysql.format(
      `SELECT * FROM reformat_cnv_tool_result
    WHERE upload_cnv_tool_result_id = ?
    ORDER BY sample, chromosome, start_basepair
    LIMIT ?, ? `,
      [uploadCnvToolResultId, initialPos, pageSize]
    );
    console.log(sql);
    const [rows] = await inCnvPool.query<mysql.RowDataPacket[]>(sql);
    const reformatCnvToolResults: ReformatCnvToolResultDto[] = [];
    rows.forEach(row => {
      const reformatCnvToolResult = this.parse(row);
      reformatCnvToolResults.push(reformatCnvToolResult);
    });
    return reformatCnvToolResults;
  }

  public getBasepairs = async (
    uploadCnvToolResultId,
    sample,
    cnvType,
    chr
  ): Promise<BasepairDto[]> => {
    const statement = `SELECT start_basepair, end_basepair 
    FROM reformat_cnv_tool_result 
    WHERE upload_cnv_tool_result_id = ? AND sample = ? AND chromosome = ? AND cnv_type = ?
    ORDER BY start_basepair, end_basepair`;
    const data = [uploadCnvToolResultId, sample, chr, cnvType];
    const sql = mysql.format(statement, data);
    console.log(sql);
    const [rows] = await inCnvPool.query<mysql.RowDataPacket[]>(sql);
    const basepairs: BasepairDto[] = [];
    for (const row of rows) {
      const basepair = new BasepairDto(row.start_basepair, row.end_basepair);
      basepairs.push(basepair);
    }
    return basepairs;
  };

  public async deleteReformatCnvToolResults(reformatIds: number[]) {
    const sql = mysql.format(
      `DELETE FROM reformat_cnv_tool_result
               WHERE reformat_cnv_tool_result_id IN (?)`,
      reformatIds
    );
    console.log(sql);
    const [resultSetHeader] = await inCnvPool.query<mysql.OkPacket>(sql);
  }

  public editReformatCnvToolResult = async (
    reformatCnvToolResult: ReformatCnvToolResultDto
  ) => {
    const reformat = reformatCnvToolResult;
    const post = [
      reformat.sample,
      reformat.chromosome,
      reformat.startBasepair,
      reformat.endBasepair,
      reformat.cnvType,
      reformat.reformatCnvToolResultId
    ];
    const sql = mysql.format(
      `UPDATE reformat_cnv_tool_result
           SET sample = ?, chromosome = ?, start_basepair = ?, end_basepair = ?, cnv_type = ? 
           WHERE reformat_cnv_tool_result_id = ?`,
      post
    );
    console.log(sql);
    const [resultSetHeader] = await inCnvPool.query<mysql.OkPacket>(sql);
  };

  public async deleteReformatByUploadId(
    uploadCnvToolResultId: number
  ): Promise<number> {
    const sql = mysql.format(
      `DELETE FROM reformat_cnv_tool_result (
      WHERE upload_cnv_tool_result_id = ?`,
      [uploadCnvToolResultId]
    );
    console.log(sql);
    const [resultSetHeader] = await inCnvPool.query<mysql.OkPacket>(sql);
    return resultSetHeader.insertId;
  }
}

export const reformatCnvToolResultDao = new ReformatCnvToolResultDao();
