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
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error(`Error downloading XML: ${error.message}`);
    process.exit(1);
  }
}


function checkMissingCdata(xmlString) {
  const lines = xmlString.split('\n');
  const missingCdataLines = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const containsTextOrSigns = /[a-zA-Z0-9!@#$%^&*()_+-=]/.test(line);
    const isCdata = /<!\[CDATA\[(.*?)\]\]>/.test(line);

    if (containsTextOrSigns && !isCdata) {
      missingCdataLines.push({ lineNumber: i + 1, content: line });
    }
  }

  return missingCdataLines;
}

async function main() {
  if (process.argv.length !== 3) {
    console.log('Usage: node check_cdata.js <XML_URL_OR_FILE_PATH>');
    process.exit(1);
  }

  const input = process.argv[2];
  let xmlString;

  if (input.startsWith('http://') || input.startsWith('https://')) {
    xmlString = await downloadXml(input);
  } else {
    xmlString = readFile(input);
  }

  const missingCdataLines = checkMissingCdata(xmlString);

  if (missingCdataLines.length > 0) {
    console.log('Missing CDATA tags in the following lines:');
    for (const lineInfo of missingCdataLines) {
      console.log(`Line ${lineInfo.lineNumber}: ${lineInfo.content}`);
    }
  } else {
    console.log('No missing CDATA tags found.');
  }
}

main();
