import { HttpException } from './../exceptions/http.exception';
import {
  TabFileMappingDto,
  HeaderColumnMapping,
  HeaderColumnIndex,
  DataFieldMapping
} from '../databases/incnv/dto/tab-file-mapping.dto';
import { reformatCnvToolResultDao } from '../databases/incnv/dao/reformat-cnv-tool-result.dao';
import fs from 'fs';
import { ReformatCnvToolResultDto } from '../databases/incnv/dto/reformat-cnv-tool-result.dto';

class ReformatCnvToolResultModel {
  /**
   * Define Index for each column
   */
  private mapHeaderColumnIndexs = (
    headerLine: string,
    column: HeaderColumnMapping
  ): HeaderColumnIndex | null => {
    // check new line
    if (!headerLine || headerLine === '') {
      throw new HttpException(400, `First line must not be a new line.`);
    }
    const columnIndex: HeaderColumnIndex = {};

    const columnNames: string[] = headerLine.split('\t');

    columnNames.forEach((columnName, i) => {
      switch (columnName) {
        case column.sampleName:
          columnIndex.sampleNameIndex = i;
          break;
        case column.chromosome:
          columnIndex.chromosomeIndex = i;
          break;
        case column.startBasepair:
          columnIndex.startBasepairIndex = i;
          break;
        case column.endBasepair:
          columnIndex.endBasepairIndex = i;
          break;
        case column.cnvType:
          columnIndex.cnvTypeIndex = i;
          break;
        default:
          break;
      }
    });

    let errorMessage = '';
    let errorColumns: string[] = [];
    columnIndex.sampleNameIndex === undefined
      ? errorColumns.push('Sample Name')
      : null;

    columnIndex.chromosomeIndex === undefined
      ? errorColumns.push('Chromosome')
      : null;
    columnIndex.startBasepairIndex === undefined
      ? errorColumns.push('Start Basepair')
      : null;
    columnIndex.endBasepairIndex === undefined
      ? errorColumns.push('End Basepair')
      : null;
    columnIndex.cnvTypeIndex === undefined
      ? errorColumns.push('Cnv Type')
      : null;

    errorColumns.forEach((errorColumn, i) => {
      if (i === 0) {
        errorMessage = errorColumn;
      } else {
        errorMessage += `, ${errorColumn}`;
      }
    });
    if (errorColumns.length > 0) {
      throw new HttpException(
        400,
        `Cannot map header column named '${errorMessage}'.  Please check file headers whether matching with the configuration of tab file mapping.`
      );
    }
    return columnIndex;
  };

  private mapDatas = (
    lines: string[],
    columnIndex: HeaderColumnIndex,
    dataFieldMapping: DataFieldMapping,
    uploadCnvToolResultId: number
  ): ReformatCnvToolResultDto[] => {
    const mappedDatas: ReformatCnvToolResultDto[] = [];

    for (let index = 1; index < lines.length; index++) {
      const line = lines[index];

      // check new line
      if (!line || line === '') {
        continue;
      }

      const data = line.split('\t');

      const mappedData = new ReformatCnvToolResultDto();

      // Map UploadCnvToolResult Id
      mappedData.uploadCnvToolResultId = uploadCnvToolResultId;

      // Map Sample Name
      mappedData.sampleName = data[columnIndex.sampleNameIndex!];

      // Map Chromosome -- Chromosome22
      if (dataFieldMapping.chromosome22!.indexOf('22')) {
        const chrIndex = dataFieldMapping.chromosome22!.indexOf('22');
        const originalChromosome = data[columnIndex.chromosomeIndex!];
        if (originalChromosome === undefined) {
          throw new HttpException(
            400,
            `At line: ${index +
              1}.  Please check file content whether matching with the configuration of tab file mapping.`
          );
        }
        mappedData.chromosome = originalChromosome
          .substring(chrIndex)
          .toLowerCase();
      } else {
        throw new HttpException(
          400,
          `At line: ${index +
            1}.  Please check file content whether matching with the configuration of tab file mapping.`
        );
      }

      // Map CNV Type
      const originalCnvType = data[columnIndex.cnvTypeIndex!];
      if (originalCnvType === dataFieldMapping.duplication) {
        mappedData.cnvType = 'dup';
      } else if (originalCnvType === dataFieldMapping.deletion) {
        mappedData.cnvType = 'del';
      } else {
        throw new HttpException(
          400,
          `At line: ${index +
            1}. Cannot map data named '${originalCnvType}'.  Please check file content whether matching with the configuration of tab file mapping.`
        );
      }

      // Map Start Basepair
      // Confirm that this value is number
      // * use regex to remove comma from number
      // * use '+' to confirm this element is number
      const originalStartBasepair = data[columnIndex.startBasepairIndex!];
      mappedData.startBasepair = Number(
        originalStartBasepair.replace(/,/gu, '')
      );

      // Map End Basepair
      // Confirm that this value is number
      // * use regex to remove comma from number
      // * use '+' to confirm this element is number
      const originalEndBasepair = data[columnIndex.endBasepairIndex!];
      mappedData.endBasepair = Number(originalEndBasepair.replace(/,/gu, ''));

      mappedDatas.push(mappedData);
    }

    return mappedDatas;
  };

  // obj is tabFileMapping
  public reformatFile = async (
    uploadCnvToolResultId,
    file,
    tabFileMapping: TabFileMappingDto
  ) => {
    // read file
    const context = fs.readFileSync(file, 'utf8');
    const lines = context.split('\n');

    try {
      // map file header
      const columnIndex = this.mapHeaderColumnIndexs(
        lines[0],
        tabFileMapping.headerColumnMapping!
      );

      // map file data
      const reformatCnvToolResults: ReformatCnvToolResultDto[] = this.mapDatas(
        lines.slice(1),
        columnIndex!,
        tabFileMapping.dataFieldMapping!,
        uploadCnvToolResultId
      );
      await this.addReformatCnvToolResults(reformatCnvToolResults);
    } catch (err) {
      // Delete all records
      reformatCnvToolResultDao.deleteReformatByUploadId(uploadCnvToolResultId);
      throw err;
    }
  };

  public addReformatCnvToolResults = async (
    reformatCnvToolResults: ReformatCnvToolResultDto[]
  ) => {
    await reformatCnvToolResultDao.addReformatCnvToolResults(
      reformatCnvToolResults
    );
  };

  public getReformatCnvToolResults = async (
    uploadCnvToolResultId: number,
    sort: string,
    order: string,
    pageNumber: number,
    pageSize: number
  ): Promise<ReformatCnvToolResultDto[]> => {
    return await reformatCnvToolResultDao.getReformatCnvToolResults(
      uploadCnvToolResultId,
      sort,
      order,
      pageNumber,
      pageSize
    );
  };
}

export const reformatCnvToolResultModel = new ReformatCnvToolResultModel();
