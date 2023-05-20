import { XMLBuilder } from 'fast-xml-parser';

export const buildMimeType = (name: string, globs: string[]) => {
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

export const wrapMimeType = (mimeType: unknown) => {
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

export const builder = new XMLBuilder({
  ignoreAttributes: false,
  suppressEmptyNode: true,
  format: true,
  // not working?
  // preserveOrder: true
});

export const generateXmlContent = (name: string, globMapper: string[]) => {
  const mimeType = buildMimeType(name, globMapper);
  const mimeJson = wrapMimeType(mimeType);
  return builder.build(mimeJson);
};
