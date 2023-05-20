import os from 'os';
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';

import { XMLBuilder } from 'fast-xml-parser';

type GlobMapper = (name: string) => string;

const buildMimeType = (name: string, globMapper: GlobMapper) => {
  return {
    comment: name,
    icon: {
      '@_name': name,
    },
    'glob-deleteall': '',
    glob: {
      '@_pattern': globMapper(name),
    },
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

const generateXmlContent = (name: string, globMapper: GlobMapper) => {
  const mimeType = buildMimeType(name, globMapper);
  const mimeJson = wrapMimeType(mimeType);
  return builder.build(mimeJson);
};

const shareDir = path.join(os.homedir(), '.local/share');
const mimeDir = path.join(shareDir, 'mime');
const iconDir = path.join(shareDir, 'icons/hicolor/scalable/mimetypes');

if (!fs.existsSync(iconDir)) {
  fs.mkdirSync(iconDir);
}

const manifestFilePath = '../vscode-icons/dist/src/vsicons-icon-theme.json';
const manifestFile = fs.readFileSync(manifestFilePath, 'utf-8');
const manifestJson = JSON.parse(manifestFile);

const langExt = JSON.parse(fs.readFileSync('data/langExt.json', 'utf-8'));

const globsMap: Record<string, GlobMapper> = {
  fileNames: (fileName: string) => fileName,
  fileExtensions: (fileExtension: string) => `*${fileExtension}`,
  languageIds: (languageId: string) => `*${langExt[languageId]}`,
};

const supported = Object.keys(globsMap);

for (const globsMapElement in manifestJson) {
  if (supported.includes(globsMapElement)) {
    for (const filename in manifestJson[globsMapElement]) {
      const relativeIconPath = manifestJson.iconDefinitions[manifestJson[globsMapElement][filename]].iconPath;
      const xmlContent = generateXmlContent(filename, globsMap[globsMapElement]);
      fs.writeFileSync(path.join(mimeDir, `packages/${filename}.xml`), xmlContent, {
        flag: 'w',
      });
      const manifestDir = manifestFilePath.replace(path.basename(manifestFilePath), '');
      const iconPath = path.resolve(manifestDir, relativeIconPath);
      fs.copyFileSync(iconPath, `${iconDir}/${filename}.svg`);
    }
  }
}

child_process.execSync(`update-mime-database ${mimeDir}`);
