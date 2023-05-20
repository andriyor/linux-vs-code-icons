import fs from 'fs';

export const mkdirIfNotExist = (path: string) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
};