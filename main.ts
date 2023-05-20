import os from 'os';
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';

import { XMLBuilder } from 'fast-xml-parser';

const buildMimeType = (name: string) => {
  return {
    comment: name,
    icon: {
      '@_name': name,
    },
    'glob-deleteall': '',
    glob: {
      '@_pattern': name,
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

const generateXmlContent = (name: string) => {
  const mimeType = buildMimeType(name);
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

for (const filename in manifestJson.fileNames) {
  const relativeIconPath = manifestJson.iconDefinitions[manifestJson.fileNames[filename]].iconPath;
  const xmlContent = generateXmlContent(filename);
  fs.writeFileSync(path.join(mimeDir, `packages/${filename}.xml`), xmlContent, {
    flag: 'w',
  });
  const manifestDir = manifestFilePath.replace(path.basename(manifestFilePath), '');
  const iconPath = path.resolve(manifestDir, relativeIconPath);
  fs.copyFileSync(iconPath, `${iconDir}/${filename}.svg`);
}

child_process.execSync(`update-mime-database ${mimeDir}`);
