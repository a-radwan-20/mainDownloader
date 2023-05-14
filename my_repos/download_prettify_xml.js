const axios = require('axios');
const fs = require('fs');
const xmlBeautifier = require('xml-beautifier');

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
    console.log('Usage: node download_prettify_xml.js <XML_URL> <OUTPUT_FILE.txt>');
    process.exit(1);
  }

  const xmlUrl = process.argv[2];
  const outputFile = process.argv[3];

  const xmlString = await downloadXml(xmlUrl);
  const prettyXml = prettifyXml(xmlString);
  saveToTextFile(prettyXml, outputFile);

  console.log(`Saved prettified XML to ${outputFile}`);
}

mainDownloader();