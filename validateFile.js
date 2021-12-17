const express = require('express');
const app = express();
const csv = require('csv-parser')
const fs = require('fs')
const results = []
let hasError

// User Input
let filename = 'customer.json'

// check valid csv data 
function validateCsv() {
    rowCount = 2;
    fs.createReadStream(filename)
        .pipe(csv())
        .on('data', (data) => {
            if(data.customer_name == '' || data.customer_address =='' || data.customer_email == ''|| data.manager_name == '' || data.contact_number == '' || data.mapping_customer_id == ''
                || Object.keys(data).length != 6
                || !parseInt(data.mapping_customer_id)
            ) {
                console.log('Error Csv Data')
                rowCount++;
                hasError = true
            }
        })
        .on('end', ()=> {
            checkFileDataIsValid()
        })
}

// check valid json data 
function validateJson() {
    let doc = fs.readFileSync(filename)
    let data = JSON.parse(doc)  
    console.log('data', data)

    for( i=0 ; i < data.length; i++) {
        if( data[i].customer_name == '' || data[i].customer_address == '' || data[i].customer_email == ''|| data[i].manager_name == '' || data[i].contact_number == '' || data[i].mapping_customer_id == ''
            || Object.keys(data[i]).length != 6
            || !parseInt(data[i].mapping_customer_id)
        ) {
            hasError = true
            console.log('Error Json Data')
        } 
    }  

    checkFileDataIsValid()
}

// check file extension is JSON or CSV and parse the file
function getFileExtension(fileName) {
    let ext = fileName.split('.').pop();
    if (ext === 'json') {
        console.log('JSON')
        validateJson()
    } else if (ext === 'csv') {
        console.log('CSV')
        validateCsv()
    } else {
        console.log('Invalid File')
    }
}
getFileExtension(filename)



// Check file has valid data or not 
function checkFileDataIsValid() {
    if (hasError !== true) {
        console.log('Valid Data')
    } else {
        console.log('Corrupt Data or missing values')
    }
}


