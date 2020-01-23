const fs = require('fs');
const bio = require('../database').bio;
const mysql = require('mysql2/promise');
const path = require('path');


class MapDataSource {
  createGeneSymbolTable = async () => {
    await bio.execute(`DROP TABLE IF EXISTS gene_symbol`);
    const sql = `CREATE TABLE gene_symbol (
      gene_id varchar(45) NOT NULL,
      gene_symbol varchar(45) NOT NULL,
      PRIMARY KEY (gene_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=latin1;`;
    console.log(sql);
    await bio.query(sql);
   
  };

  addGeneSymbol = async (dataList) => {
    const sql = `INSERT INTO gene_symbol ( 
          gene_id, gene_symbol) VALUES ?`;
    const statement = mysql.format(sql, [dataList]);
    const [resultSetHeader_grch37] = await bio.query(
      statement
    );

    
  };

  // return [any[], any[]]
  mapDataSource = ()  => {
    // read file
    const file = path.join(
      __dirname,
      'source',
      'gene_symbol.txt'
    );
    const context = fs.readFileSync(file, 'utf8');
    const lines = context.split('\n');

    const dataList = [];
  

    for (const line of lines) {
      // line space
      if (!line || line === '') continue;

      //ignore a commented line
      if (line.charAt(0) === '#') continue;

      const columns = line.split('\t');

      const gene_symbol = columns[0], gene_id = columns[1];
        
    
      if(gene_symbol && gene_id) {
        const data = [ gene_id, gene_symbol ];
        dataList.push(data);
      }
    
      
    }

    return dataList;
  };

  async main() {
    const dataList = this.mapDataSource();
    await this.createGeneSymbolTable();
    await this.addGeneSymbol(dataList);
    console.log('SUCCESS!!');
  }
}

const mapDataSource = new MapDataSource();
mapDataSource.main();
