import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

const csvFilePath = path.resolve(__dirname, 'import_template.csv');

const readCSVStream = fs.createReadStream(csvFilePath);

const parseStream = csvParse({
  from_line: 2,
  ltrim: true,
  rtrim: true,
});

const parseCSV = readCSVStream.pipe(parseStream);
const data = loadCSV(csvFilePath);

parseCSV.on('data', line => {
  console.log(line);
});

parseCSV.on('end', () => {
  console.log('Leitura do CSV finalizada');
});

async function loadCSV(filePath: string): Promise<any[]> {
  const readCSVStream = fs.createReadStream(csvFilePath);

  const parseStream = csvParse({
    from_line: 2,
    ltrim: true,
    rtrim: true,
  });

  const parseCSV = readCSVStream.pipe(parseStream);

  const lines: any[] | PromiseLike<any[]> = [];

  parseCSV.on('data', line => {
    lines.push(line);
  });

  await new Promise(resolve => {
    parseCSV.on('end', resolve);
  });

  return lines;
}
