# Main Files

You can get the array of main js or css files from your dependencies mentioned in your package.json

## Installation

```shell
npm i -s main-files
```

## Usage

```javascript
// ES6
import mainFiles from "main-files";
// ES5
var mainFiles = require("main-files");

const options = {
  // {css|js} default = js
  what: "js",
  // absolute path to your node_modules main folder; default = (guess)
  // hint: you can use path.resolve for absolute path
  node_modules: "/absolute/path/to"
};

let requiredFilesArray = mainFiles(options);
```

### Overrides

You can override each of the library in package.json. You can put overrides poperty

Example:

```json
"overrides": {
  // ignore the package comletely
  "bootstrap": false
  // OR
  "bootstrap": {
    // ignore both, js or css files
    "ignore": true,
    "ignoreJS": true,
    "ignoreCSS": true,
    // if main in the library is not defined
    "main": "dist/bootstrap.min.js",
    // if style library is not defined
    "style": "dist/bootstrap.min.css",
    // sort order | mentioning sort will sort that library in array on mentioned number
    "sort": 1
  }
}
```
### Short hand for common settings

##### Sort

```json
"overrides": {
	// shorthand for sort option
    // (number can be (-ive) & Zero will behave like false)
	"bootstrap": 3
}
```

##### Ignore

```json
"overrides": {
	// shorthand for ignore the package completely
    // false or zero i.e. 0
	"bootstrap": false 
}
```



### Per module settings

You can include these keys in your **package.json** for this module

```json
"ignore": false,
"ignoreCSS": false,
"ignoreJS": false,
"main": "dist/bootstrap.min.js",
"style": "dist/bootstrap.min.css"
```



### Todos

- publish @types for the library
- add unit tests