// import mariadb
const mariadb = require('mariadb');

// create a new connection poold
const pool = mariadb.createPool({
  host: "127.0.0.1",
  user: "root",
  password: "mariadb",
  database: "factures"
});


const sendQuery = (query) => {
  return new Promise(async (resolve, reject) => {
    let connection = {};

    try {
      connection = await pool.getConnection();

      const results = await connection.query(query);

      resolve(results);
    } catch (error) {
      reject(error);
    } finally {
      if (connection) return connection.release();
    }
  })
}

exports.sendQuery = sendQuery;


