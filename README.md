# Main Files

You can get the main files installed in your package.json

## Installation

```
npm i -s main-files
```

## Usage

```
// ES6
import mainFiles from "main-files";
// ES5
var mainFiles = require("main-files");

const options = {
  // {css|js} default = js
  what: "js",
  // absolute path to your node_modules main folder; default = (guess)
  node_modules: "/path/to"
};

let requiredFilesArray = mainFiles(options);
```

### Overrides

You can override each of the library in package.json. You can put overrides poperty

Example:

```
"overrides": {
  "bootstrap": {
    // if main in the library is not defined
    "main": "dist/bootstrap.min.js",
    // if style library is not defined
    "style": "dist/bootstrap.min.css",
    // sort order | mentioning sort will sort that library in array on mentioned number
    "sort": 1
  }
}
```
### Per module settings

You can include these keys in your package.json for this module

```
"ignore": false,
"ignoreCSS": false,
"ignoreJS": false,
"main": "dist/bootstrap.min.js",
"style": "dist/bootstrap.min.css"
```



## TODOS

- publish @types for the library
- add unit tests