const express = require('express');
const app = express();
const csv = require('csv-parser')
const fs = require('fs')
const serverConfig = require('./config/serverConfig.js')
const results = []
let hasError

// Connetion to DB 
serverConfig.connect(function(err) {
    if (err) throw err;
    console.log("Connected!");
});

function csvToDb() {
    rowCount = 2;
    fs.createReadStream('customer.csv')
        .pipe(csv())
        .on('data', (data) => {
            if(data.customer_name == '' || data.customer_address =='' || data.customer_email == ''|| data.manager_name == '' || data.contact_number == '' || data.mapping_customer_id == ''
                || Object.keys(data).length != 6
                ) {
                console.log('Error Data', rowCount)
                rowCount++;
                hasError = true
            } else {
                if (!parseInt(data.mapping_customer_id)) { // check if mapping customer id is Integer
                    console.log('Invalid mapping customer ID on line ', rowCount, " of CSV")
                    rowCount++;
                    hasError = true;
                } else {
                    results.push([data.customer_name,data.customer_address,data.customer_email,data.manager_name,data.contact_number,parseInt(data.mapping_customer_id)])
                    rowCount++;
                }
            }
        })
        .on('end', ()=> {
            console.log('end',results)
     
            checkFileHasError()

        })
}

function jsonToDb() {
    let doc = fs.readFileSync('customer.json')
    let data = JSON.parse(doc)  
    console.log('data', data)

    for( i=0 ; i < data.length; i++) {
        if( data[i].customer_name == '' || data[i].customer_address == '' || data[i].customer_email == ''|| data[i].manager_name == '' || data[i].contact_number == '' || data[i].mapping_customer_id == ''
        || Object.keys(data[i]).length != 6
        ) {
            hasError = true
        console.log('Error Json')
        } 
        else {
            if (!parseInt(data[i].mapping_customer_id)) { // check if mapping customer id is Integer
                hasError = true;
            } else {
                results.push([data[i].customer_name,data[i].customer_address,data[i].customer_email,data[i].manager_name,data[i].contact_number,parseInt(data[i].mapping_customer_id)])
                console.log('results', results)
            }
        }
    }  

    checkFileHasError()
}

// Checking file is JSON or CSV
function getExtension(filename) {
    let ext = filename.split('.').pop();
    if (ext === 'json') {
        console.log('JSON')
        jsonToDb()
    } else if (ext === 'csv') {
        console.log('CSV')
        csvToDb()
    } else {
        console.log('Invalid File')
    }
}
getExtension('customer.csv')

// Insert Data in database
function insertDataIntoDB() {
    let sql = `INSERT INTO customer_data (customer_name,customer_address,customer_email,manager_name,contact_number,mapping_customer_id) VALUES ?`;

    serverConfig.query(sql, [results], function (err, result) {
    if (err) throw err;
    console.log("Number of records inserted: " + result.affectedRows);
    });
}

// Check file has error or not and then allow to insert data else error
function checkFileHasError() {
    if (hasError !== true) {
        console.log('Inserted Data Successfully')
        insertDataIntoDB()
    } else {
        console.log('Corrupt Data or missing values')
    }
}


app.listen(() => console.log('connected on port 3306'))