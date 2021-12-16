const mysql = require('mysql');

let serverConfig = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'customer'
    })

module.exports = serverConfig;