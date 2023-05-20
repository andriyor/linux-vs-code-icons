import os from 'os';
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';

import { XMLBuilder } from 'fast-xml-parser';

const argv = require('yargs-parser')(process.argv.slice(2));

type GlobMapper = (name: string[]) => string[];

// console.log(argv);
// if (!argv.file) {
//   console.log('provide file path to manifest');
// }
// if (path.extname(argv.file) !== 'json') {
//   console.log('file should be json');
// }

const buildMimeType = (name: string, globs: string[]) => {
  return {
    comment: name,
    icon: {
      '@_name': name,
    },
    'glob-deleteall': '',
    glob: globs.map((glob) => {
      return {
        '@_pattern': glob,
      };
    }),
    '@_type': `text/${name}`,
  };
};

const wrapMimeType = (mimeType: unknown) => {
  return {
    '?xml': {
      '@_version': '1.0',
      '@_encoding': 'UTF-8',
    },
    'mime-info': {
      'mime-type': mimeType,
      '@_xmlns': 'http://www.freedesktop.org/standards/shared-mime-info',
    },
  };
};

const builder = new XMLBuilder({
  ignoreAttributes: false,
  suppressEmptyNode: true,
  format: true,
  // not working?
  // preserveOrder: true
});

const generateXmlContent = (name: string, globMapper: string[]) => {
  const mimeType = buildMimeType(name, globMapper);
  const mimeJson = wrapMimeType(mimeType);
  return builder.build(mimeJson);
};

const shareDir = path.join(os.homedir(), '.local/share');
const mimeDir = path.join(shareDir, 'mime');
const iconDir = path.join(shareDir, 'icons/hicolor/scalable/mimetypes');

const mkdirIfNotExist = (path: string) => {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
};

mkdirIfNotExist(iconDir);

const manifestFilePath = '../vscode-icons/dist/src/vsicons-icon-theme.json';
const manifestFile = fs.readFileSync(manifestFilePath, 'utf-8');
const manifestJson = JSON.parse(manifestFile);

const langExt = JSON.parse(fs.readFileSync('data/langExt.json', 'utf-8'));

const globsMap: Record<string, GlobMapper> = {
  fileNames: (fileName: string[]) => fileName,
  languageIds: (languageIds: string[]) => languageIds.map((languageId) => `*.${langExt[languageId]}`),
};

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

child_process.execSync(`update-mime-database ${mimeDir}`);
