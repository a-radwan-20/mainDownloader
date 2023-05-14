const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs');

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

async function parseXml(xmlString) {
  const parser = new xml2js.Parser({ explicitArray: false });
  return await parser.parseStringPromise(xmlString);
}

function countTags(xmlObject) {
  const tagCounts = {};

  function traverse(node) {
    if (typeof node === 'object') {
      for (const key in node) {
        if (tagCounts[key]) {
          tagCounts[key]++;
        } else {
          tagCounts[key] = 1;
        }

        if (node[key] instanceof Array) {
          for (const item of node[key]) {
            traverse(item);
          }
        } else {
          traverse(node[key]);
        }
      }
    }
  }

  traverse(xmlObject);
  return tagCounts;
}

async function mainCountTags() {
  if (process.argv.length !== 3) {
    console.log('Usage: node count_tags.js <XML_URL_OR_FILE_PATH>');
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
  const tagCounts = countTags(xmlObject);

  console.log('Tag counts:');
  for (const tag in tagCounts) {
    console.log(`${tag}: ${tagCounts[tag]}`);
  }
}


mainCountTags();
