const axios = require('axios');
const fs = require('fs');
const xml2js = require('xml2js');

const parser = new xml2js.Parser();

async function downloadXml(url) {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error downloading XML: ${error.message}`);
    process.exit(1);
  }
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`Error reading file: ${error.message}`);
    process.exit(1);
  }
}

async function parseXml(xmlString) {
  return new Promise((resolve, reject) => {
    parser.parseString(xmlString, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

// function findLineNumber(xmlString, pattern) {
//   const regex = new RegExp(pattern, 'g');
//   const lines = xmlString.substring(0, xmlString.search(regex)).split('\n');
//   return lines.length;
// }


function validateXml(xmlString, xmlObject) {
  const mandatoryJobTags = [
    'title',
    'date',
    'referencenumber',
    'requisitionid',
    'url',
    'company',
    'sourcename',
    'city',
    'state',
    'country',
    'email',
    'description',
  ];
  const xmlSource = xmlObject.source;
  
  const openingSourceTagRegex = /<source>/;
  const closingSourceTagRegex = /<\/source>/;
  const openingJobTagRegex = /<job>/;
  const closingJobTagRegex = /<\/job>/;

  if (!openingSourceTagRegex.test(xmlString)) {
    const lineNumber = xmlString.substring(0, xmlString.search(openingSourceTagRegex)).split('\n').length;
    console.log(`The opening <source> tag is missing or malformed. Check line ${lineNumber}.`);
    return false;
  }

  if (!closingSourceTagRegex.test(xmlString)) {
    const lineNumber = xmlString.substring(0, xmlString.search(closingSourceTagRegex)).split('\n').length;
    console.log(`The closing </source> tag is missing or malformed. Check line ${lineNumber}.`);
    return false;
  }

  if (!openingJobTagRegex.test(xmlString)) {
    const lineNumber = xmlString.substring(0, xmlString.search(openingJobTagRegex)).split('\n').length;
    console.log(`The opening <job> tag is missing or malformed. Check line ${lineNumber}.`);
    return false;
  }

  if (!closingJobTagRegex.test(xmlString)) {
    const lineNumber = xmlString.substring(0, xmlString.search(closingJobTagRegex)).split('\n').length;
    console.log(`The closing </job> tag is missing or malformed. Check line ${lineNumber}.`);
    return false;
  }

  const xmlJobs = xmlSource.job;
  for (const xmlJob of xmlJobs) {
    for (const tag of mandatoryJobTags) {
      if (!xmlJob[tag]) {
        console.log(`The <${tag}> tag is missing or not properly closed.`);
        return false;
      }
    }
  }

  return true;
}


async function main() {
  if (process.argv.length !== 3) {
    console.log('Usage: node validate_xml.js <XML_URL_OR_FILE_PATH>');
    process.exit(1);
  }

  const input = process.argv[2];
  let xmlString;

  if (input.startsWith('http://') || input.startsWith('https://')) {
    xmlString = await downloadXml(input);
  } else {
    xmlString = readFile(input);
  }

  const xmlObject = await parseXml(xmlString);

  if (validateXml(xmlString, xmlObject)) {
    console.log('The XML file/feed matches the Indeed XML structure.');
  } else {
    console.log('The XML file/feed does not match the Indeed XML structure.');
  }
}

main();
