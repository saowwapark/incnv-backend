const fs = require('fs');
const clinvar_37 = require('../database').clinvar_37;
const clinvar_38 = require('../database').clinvar_38;
const mysql = require('mysql2/promise');
const path = require('path');
const readline = require('readline-sync');


class MapDataSource {
  createClinvarTable = async () => {
    await clinvar_37.execute(`DROP TABLE IF EXISTS clinvar`);
    await clinvar_38.execute(`DROP TABLE IF EXISTS clinvar`);
    const sql = `CREATE TABLE clinvar (
      clinvar_id int(3) unsigned NOT NULL AUTO_INCREMENT,
      allele_id int(11) DEFAULT NULL,
      type varchar(45) DEFAULT NULL,
      name varchar(800),
      gene_id varchar(45) DEFAULT NULL,
      gene_symbol varchar(700),
      hgnc_id varchar(45) DEFAULT NULL,
      clinical_significance varchar(128) DEFAULT NULL,
      last_evaluated date DEFAULT NULL,
      rs_dbSNP varchar(45) DEFAULT NULL,
      omim_ids varchar(255),
      omim_list varchar(1300),
      chr varchar(45)  NOT NULL,
      start int(4) unsigned NOT NULL,
      end int(4) unsigned NOT NULL,
      cytogenetic varchar(45) DEFAULT NULL,
      PRIMARY KEY (clinvar_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1;`;
    console.log(sql);
    await clinvar_37.query(sql);
    await clinvar_38.query(sql);
  };

  addClinvar = async ([mapped_grch37, mapped_grch38]) => {
    const sql = `INSERT INTO clinvar ( 
          allele_id,
          type,
          name,
          gene_id,
          gene_symbol,
          hgnc_id,
          clinical_significance,
          last_evaluated,
          rs_dbSNP,
          omim_ids,
          omim_list,
           chr,
          start,
          end,
          cytogenetic) VALUES ?`;
    const statement_grch37 = mysql.format(sql, [mapped_grch37]);

    // console.log(statement_grch37);
    const [resultSetHeader_grch37] = await clinvar_37.query(
      statement_grch37
    );

    const statement_grch38 = mysql.format(sql, [mapped_grch38]);
    // console.log(statement_grch38);
    const [resultSetHeader_grch38] = await clinvar_38.query(
      statement_grch38
    );
  };

  // return [any[], any[]]
  mapDataSource = ()  => {
    // read file
    const file = path.join(
      __dirname,
      'source',
      'variant_summary_2019-03-12.txt'
    );
    const context = fs.readFileSync(file, 'utf8');
    const lines = context.split('\n');

    const datalist_grch37 = [];
    const datalist_grch38 = [];

    for (const line of lines) {
      // line space
      if (!line || line === '') continue;

      //ignore a commented line
      if (line.charAt(0) === '#') continue;

      const columns = line.split('\t');

      const allele_id = columns[0],
        type = columns[1],
        name = columns[2],
        gene_id = columns[3],
        gene_symbol = columns[4],
        hgnc_id = columns[5],
        clinical_significance = columns[6],
        last_evaluated = columns[8],
        rs_dbSNP = columns[9],
        phenotype_ids = columns[12].split(','),
        omim_list = columns[13],
        chr = columns[18],
        start = columns[19],
        end = columns[20],
        cytogenetic = columns[23];

      if (!chr || chr === 'na') continue;

      const omim_ids = [];
      const assembly = columns[16];
      for (const phenotype_id of phenotype_ids) {
        if (phenotype_id.substring(0, 4) !== 'OMIM') continue;
        const omim_id = phenotype_id.substring(5, 11);
        omim_ids.push(omim_id);
      }

      if (omim_ids.length < 1) continue;
      const data = [
        allele_id,
        type,
        name,
        gene_id,
        gene_symbol,
        hgnc_id ? hgnc_id.substring(5) : hgnc_id,
        clinical_significance,
        new Date(last_evaluated),
        rs_dbSNP,
        JSON.stringify(omim_ids),
        omim_list,
        chr,
        start,
        end,
        cytogenetic
      ];
      if (assembly === 'GRCh37') {
        datalist_grch37.push(data);
      } else {
        datalist_grch38.push(data);
      }
    }

    return [datalist_grch37, datalist_grch38];
  };

  async main() {
    const [datalist_grch37, datalist_grch38] = this.mapDataSource();
    await this.createClinvarTable();
    await this.addClinvar([datalist_grch37, datalist_grch38]);
    console.log('SUCCESS!!');
  }
}

const mapDataSource = new MapDataSource();
mapDataSource.main();
