'use strict';

const fs = require('fs');
const axios = require('axios');

const namsorUrlPrefix = 'http://api.namsor.com/onomastics/api/json/gender';
const genderMap = {};
const namsorRequests = [];
let names;

function process(inputFilePath, outputFilePath) {
    names = getNames(inputFilePath);
    names.forEach(processName);
    axios.all(namsorRequests)
    .then(() => outputResults(outputFilePath))
    .catch(err => {
        console.error(err);
    });
}


function getNames(inputFilePath) {
    console.log(`Getting names from file: ${inputFilePath}`)
    let fileContent = fs.readFileSync(inputFilePath, 'utf8');
    const names = fileContent.split('\n');
    return names;
}

function processName(name) {
    console.log(`Processing name: ${name}`)
    let nameParts = name.split(',');
    let firstName = nameParts[0].trim();
    let lastName = nameParts[1].trim();
    let url = namsorUrlPrefix + `/${firstName}/${lastName}`;
    let namsorRequest = axios.get(url).then(response => {
        genderMap[name] = {
            firstName: firstName,
            lastName: lastName,
            gender: response.data.gender
        };
    });
    namsorRequests.push(namsorRequest);
}

function outputResults(outputFilePath) {
    console.log(`Outputting results to file: ${outputFilePath}`)
    let output = '';
    names.forEach(name => {
        let info = genderMap[name];
        output += `${info.firstName}, ${info.lastName}, ${info.gender}\n`
    });
    fs.writeFileSync(outputFilePath, output.trim());
}

module.exports = {
    process
}