var sql = require("mssql");

// config for your database
var config = {
    user: 'dimitrij',
    password: 'Mariadb10!',
    server: 'factures-server.database.windows.net',
    database: 'factures',
    options:{
        enableArithAbort: true
    }
};

const sendQuery = (query) => {
    return new Promise(async (resolve, reject) => {
        let connection = {};
    
        try {
          connection = await sql.connect(config);
    
          const results = await connection.query(query);
          resolve(results.recordset);
        } catch (error) {
          reject(error);
        }
      })
}

exports.sendQuery = sendQuery;