const express = require('express');
const app = express();
const csv = require('csv-parser')
const fs = require('fs')
const serverConfig = require('./config/serverConfig.js')
const results = []
let hasError

// User Input
let filename = 'customer.json'

// Connetion to DB  
serverConfig.connect(function(err) {
    if (err) throw err;
    console.log("Database Connected!");
});

// check valid csv data 
function validateCsvToDb() {
    fs.createReadStream(filename)
        .pipe(csv())
        .on('data', (data) => {

            if(data.customer_name == '' || data.customer_address =='' || data.customer_email == ''|| data.manager_name == '' || data.contact_number == '' || data.mapping_customer_id == ''
                || Object.keys(data).length != 6
                ) {
                    console.log('Error Csv Data')
                    hasError = true
            } else {
                if (!parseInt(data.mapping_customer_id)) { // check if mapping customer id is Integer
                    hasError = true;
                } else { 
                    // converting array of objects to array of array and push in results array
                    results.push([data.customer_name,data.customer_address,data.customer_email,data.manager_name,data.contact_number,parseInt(data.mapping_customer_id)])
                }
            }
        })
        .on('end', ()=> {
            console.log('end',results)
            checkFileDataIsValid()
        })
}

// check valid json data 
function validateJsonToDb() {
    let doc = fs.readFileSync(filename)
    let data = JSON.parse(doc)  
    console.log('data', data)

    for( i=0 ; i < data.length; i++) {

        if( data[i].customer_name == '' || data[i].customer_address == '' || data[i].customer_email == ''|| data[i].manager_name == '' || data[i].contact_number == '' || data[i].mapping_customer_id == ''
        || Object.keys(data[i]).length != 6
        ) {
            hasError = true
        console.log('Error Json Data')
        } 
        else {
            if (!parseInt(data[i].mapping_customer_id)) { // check if mapping customer id is Integer
                hasError = true;
            } else {
                // converting array of objects to array of array and push in results array
                results.push([data[i].customer_name,data[i].customer_address,data[i].customer_email,data[i].manager_name,data[i].contact_number,parseInt(data[i].mapping_customer_id)])
                console.log('results', results)
            }
        }
    }  

    checkFileDataIsValid()
}

// check file is JSON or CSV and parse it
function getFileExtension(fileName) {
    let ext = fileName.split('.').pop();
    if (ext === 'json') {
        console.log('JSON')
        validateJsonToDb()
    } else if (ext === 'csv') {
        console.log('CSV')
        validateCsvToDb()
    } else {
        console.log('Invalid File')
    }
}
getFileExtension(filename)

// query to insert Data in database
function insertDataIntoDB() {
    let sql = `INSERT INTO customer_data (customer_name,customer_address,customer_email,manager_name,contact_number,mapping_customer_id) VALUES ?`;

    serverConfig.query(sql, [results], function (err, result) {
    if (err) throw err;
    console.log("Number of records inserted: " + result.affectedRows);
    });
}

// Check file is valid and insert data into DB
function checkFileDataIsValid() {
    if (hasError !== true) {
        console.log('Inserted Data Successfully')
        insertDataIntoDB()
    } else {
        console.log('Corrupt Data or missing values')
    }
}


app.listen(() => console.log('connected on port 3306'))