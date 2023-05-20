import fs from 'fs';
import path from 'path';

export const validateArg = (argv: any) => {
  if (!argv.file) {
    return console.log('Provide file path to icon manifest by --file');
  }
  if (path.extname(argv.file) !== '.json') {
    return console.log('File should be with .json extension');
  }
  if (!fs.existsSync(argv.file)) {
    return console.log('File not exist');
  }
  return true
}