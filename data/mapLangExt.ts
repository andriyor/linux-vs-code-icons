import fs from 'fs';

const file= fs.readFileSync('data/language-id-ext.json', 'utf-8');
const json = JSON.parse(file);

const langExt: Record<string, string> = {};
for (const jsonElement in json) {
  if (!Array.isArray(json[jsonElement].ids)) {
    langExt[json[jsonElement].ids] = json[jsonElement].exts;
  }
}

fs.writeFileSync('data/langExt.json', JSON.stringify(langExt,  null, 2));
