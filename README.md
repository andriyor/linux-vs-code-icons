# linux-vs-code-icons

Generate freedesktop [shared-mime-info](https://freedesktop.org/wiki/Specifications/shared-mime-info-spec/) based on [VS code file Icon theme](https://code.visualstudio.com/api/extension-guides/file-icon-theme) 

## Usage


```shell
git clone git@github.com:vscode-icons/vscode-icons.git
cd vscode-icons
npm i
npm run build
cd ../linux-vs-code-icons
npx tsx src/index.ts --file ../vscode-icons/dist/src/vsicons-icon-theme.json
```

<img src="https://user-images.githubusercontent.com/11459840/239712539-31ed3a36-570a-4995-9460-a95259666fd2.png"
     alt="Markdown Monster icon"
     style="float: left; margin-right: 10px;" />


## TODO

- [x] icons for fileNames
- [x] fileExtensions
- [x] languageIds
- [x] cli
- [ ] fix mdx icon
- [ ] mac support
