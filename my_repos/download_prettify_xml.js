const axios = require('axios');
const fs = require('fs');
const xmlBeautifier = require('xml-beautifier');

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch (error) {
    console.error(`Error reading file: ${error.message}`);
    process.exit(1);
  }
}

async function downloadXml(url) {
  try {
    const response = await axios.get(url, { responseType: 'text' });
    return response.data;
  } catch (error) {
    console.error(`Error downloading XML: ${error.message}`);
    process.exit(1);
  }
}

function prettifyXml(xmlString) {
  return xmlBeautifier(xmlString);
}

function saveToTextFile(prettyXml, outputFilePath) {
  fs.writeFileSync(outputFilePath, prettyXml, 'utf-8');
}

async function mainDownloader() {
  if (process.argv.length !== 4) {
    console.log('Usage: node download_prettify_xml.js <XML_URL_OR_FILE_PATH> <OUTPUT_FILE.txt>');
    process.exit(1);
  }

  const input = process.argv[2];
  const outputFile = process.argv[3];
  let xmlString;

  if (input.startsWith('http://') || input.startsWith('https://')) {
    xmlString = await downloadXml(input);
  } else {
    xmlString = readFile(input);
  }

  const prettyXml = prettifyXml(xmlString);
  saveToTextFile(prettyXml, outputFile);

  console.log(`Saved prettified XML to ${outputFile}`);
}


mainDownloader();