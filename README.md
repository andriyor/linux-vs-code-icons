# linux-vs-code-icons

Generate freedesktop [shared-mime-info](https://freedesktop.org/wiki/Specifications/shared-mime-info-spec/) based on [VS code file Icon theme](https://code.visualstudio.com/api/extension-guides/file-icon-theme) 

## Usage

```shell
git clone git@github.com:andriyor/linux-vs-code-icons.git
```

For [vscode-icons](https://github.com/vscode-icons/vscode-icons)

```shell
git clone git@github.com:vscode-icons/vscode-icons.git
cd vscode-icons
npm i
npm run build
cd ../linux-vs-code-icons
npx tsx src/index.ts --file ../vscode-icons/dist/src/vsicons-icon-theme.json
```

For [vscode-material-icon-theme](https://github.com/PKief/vscode-material-icon-theme)

```shell
git clone git@github.com:PKief/vscode-material-icon-theme.git
cd vscode-material-icon-theme
npm i
npm run build
cd ../vscode-material-icon-theme
npx tsx src/index.ts --file ../vscode-material-icon-theme/dist/material-icons.json
```

Example of result on [Krusader](https://krusader.org/)

<img src="https://user-images.githubusercontent.com/11459840/239712539-31ed3a36-570a-4995-9460-a95259666fd2.png"/>


## How it works

Script reads VS code file icon theme, copy `svg` icons to `.local/share/icons/hicolor/scalable/mimetypes` directory and create shared-mime-info file in `.local/share/mime/packages` directory based on file extension.

Example for `.tsx` files:

`.local/share/mime/packages/typescriptreact.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<mime-info xmlns="http://www.freedesktop.org/standards/shared-mime-info">
  <mime-type type="text/typescriptreact">
    <comment>typescriptreact</comment>
    <icon name="typescriptreact"/>
    <glob-deleteall/>
    <glob pattern="*.tsx"/>
  </mime-type>
</mime-info>

```

And then run such command

```shell
update-mime-database ~/.local/share/mime
```

## TODO

- [x] fileNames
- [x] fileExtensions
- [x] languageIds
- [x] CLI
- [ ] fix broken mime types overrides 
- [ ] [mac support](https://superuser.com/questions/178316/how-to-set-an-icon-for-a-file-type-on-mac)
