const fs = require('fs');
const pdf = require('pdf-parse');

let dataBuffer = fs.readFileSync('teste gil.pdf');

const parser = pdf;

parser(dataBuffer).then(function (data) {
    fs.writeFileSync('pdf_text.txt', data.text);
    console.log("Wrote to pdf_text.txt");
}).catch(e => console.error(e));
