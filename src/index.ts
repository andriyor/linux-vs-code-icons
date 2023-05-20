import os from 'os';
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';

import { generateXmlContent, validateArg, mkdirIfNotExist } from './helpers';

const argv = require('yargs-parser')(process.argv.slice(2));

type GlobMapper = (name: string[]) => string[];

if (!validateArg(argv)) {
  process.exit();
}

const shareDir = path.join(os.homedir(), '.local/share');
const mimeDir = path.join(shareDir, 'mime');
const iconDir = path.join(shareDir, 'icons/hicolor/scalable/mimetypes');

mkdirIfNotExist(iconDir);

const manifestFilePath = argv.file;
const manifestFile = fs.readFileSync(manifestFilePath, 'utf-8');
const manifestJson = JSON.parse(manifestFile);

const langExt = JSON.parse(fs.readFileSync('data/langExt.json', 'utf-8'));

const generate = (name: string, iconRef: string, globs: string[]) => {
  const relativeIconPath = manifestJson.iconDefinitions[iconRef].iconPath;
  const xmlContent = generateXmlContent(name, globs);
  const xmlDir = path.join(mimeDir, 'packages');
  mkdirIfNotExist(xmlDir);
  fs.writeFileSync(path.join(xmlDir, `${name}.xml`), xmlContent, {
    flag: 'w',
  });
  const manifestDir = manifestFilePath.replace(path.basename(manifestFilePath), '');
  const iconPath = path.resolve(manifestDir, relativeIconPath);
  fs.copyFileSync(iconPath, `${iconDir}/${name}.svg`);
};

console.log('Create manifest and icons');

const globsMap: Record<string, GlobMapper> = {
  fileNames: (fileName: string[]) => fileName,
  languageIds: (languageIds: string[]) => languageIds.map((languageId) => `*.${langExt[languageId]}`),
};

const supported = Object.keys(globsMap);

for (const globsMapElement in manifestJson) {
  if (supported.includes(globsMapElement)) {
    for (const filename in manifestJson[globsMapElement]) {
      const globs = globsMap[globsMapElement]([filename]);
      generate(filename, manifestJson[globsMapElement][filename], globs);
    }
  }
}

const getIconFileExt = () => {
  const extIcon: Record<string, string[]> = {};
  for (const fileExtension in manifestJson.fileExtensions) {
    extIcon[manifestJson.fileExtensions[fileExtension]];
    if (extIcon[manifestJson.fileExtensions[fileExtension]]) {
      extIcon[manifestJson.fileExtensions[fileExtension]].push(fileExtension);
    } else {
      extIcon[manifestJson.fileExtensions[fileExtension]] = [fileExtension];
    }
  }
  return extIcon;
};

const iconFileExt = getIconFileExt();
for (const iconRef in iconFileExt) {
  // handle vscode-icons theme
  const iconRefNormalized = iconRef.replace('_f_', '');
  const globs = iconFileExt[iconRef].map((ext) => `*.${ext}`);
  generate(iconRefNormalized, iconRef, globs);
}

console.log('Update mime database');
child_process.execSync(`update-mime-database ${mimeDir}`);
console.log('Icons updated');
