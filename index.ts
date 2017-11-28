import * as fs from "fs"
import * as path from "path"
import * as glob from "glob"
import * as _ from "lodash"

// hack function to extract the node_modules folder name
export function extractNodeModulesPath () {
  const tempPath = require.resolve("glob")
  const indxOfNM = tempPath.indexOf("node_modules")
  return path.resolve(tempPath.substr(0, indxOfNM), "./node_modules")
}


/**
 * This will return the array of files mentioned as main in the installed dependencies
 * @param options options for the function e.g. {what: "js"|"css", node_modules: *absolutePath to nodeModules*}
 */
export default function (options: any = {}) {
  let nodeResolved = extractNodeModulesPath()
  let aE = false

  if (_.hasIn(options, "node_modules")) {
    aE = true
    nodeResolved = path.resolve(options["node_modules"])
  }

  if (!path.isAbsolute(nodeResolved) || !fs.existsSync(nodeResolved) ) {
    throw Error("Unable to find node_modules. " + (aE ? "Check your provided path" : "Specify path manually"))
  }

  const defaultOptions = {
    node_modules: nodeResolved,
    what: "js",
    packageJsonPath: "./package.json"
  }
  options = _.extend(defaultOptions, (options || {}))

  let buffer = fs.readFileSync(options.packageJsonPath)
  let packages = JSON.parse(buffer.toString())
  let key
  let keys = []
  
  const overrides = packages.overrides || {}
  let override

  for (key in packages.dependencies) {
    override = _.hasIn(overrides, key) ? overrides[key] : {}
    if (!override ||
      override.ignore ||
      (options.what === "js" && override.ignoreJS) ||
      (options.what === "css" && override.ignoreCSS)
    ) {
      continue
    }
    else {
      keys = keys.concat(getFiles(options.node_modules + "/" + key, override, options.what))
    }
  }  
  keys = sortifyKeys(keys)
  keys = normalizeKeys(keys)
  return keys
}

function normalizeKeys(keys) {
  let tempKeys = []
  _.each(keys, (key) => {
    if (_.isArray(key.files)) {
      tempKeys.push(...key.files)
    }
    else if (_.hasIn(key, "files")){
      tempKeys.push(key.files)
    }
  })
  return tempKeys
}

function sortifyKeys(arr: any[]) {
  // fill in the non sorted array with default sorting
  let sortedKeys = []
  _.each(arr, (key, indx) => {
    if (_.isObject(key)) {
      sortedKeys.splice(key.sort, 0, key)
    }
    else {
      sortedKeys.splice(sortedKeys.length, 0, {
        sort: arr.length + 1,
        files: [].concat(key)
      })
    }
  })

  sortedKeys = _.sortBy(sortedKeys, "sort")
  return sortedKeys
}

function getFiles(modulePath, override, what = "js") {
  const packageJsonName = "/package.json"
  const json = JSON.parse(fs.readFileSync(path.join(modulePath, packageJsonName)).toString())
  let files = []

  if (
    json.ignore ||
    (what === "js" && json.ignoreJS) ||
    (what === "css" && json.ignoreCSS)    
  ) {
    return []
  }
  if (what === "js") {
    if (typeof override.main === "object") {
      _.each(override.main, currentMainFile => {
        files = files.concat(glob.sync(require.resolve(modulePath + "/" + currentMainFile)))
      })
    }
    else if (typeof override.main === "string") {
      files = files.concat(glob.sync(require.resolve(modulePath + "/" + override.main)))
    }
    else if (json.main) {
      files = files.concat(glob.sync(require.resolve(modulePath + "/" + json.main)))
    }
  }
  else {
    if (typeof override.style === "object") {
      override.style.forEach( currentMainFile => {
        files = files.concat(glob.sync(require.resolve(modulePath + "/" + currentMainFile)))
      })
    }
    else if (typeof override.style === "string") {
      files = files.concat(glob.sync(require.resolve(modulePath + "/" + override.style)))
    }
    else if (json.style) {
      files = files.concat(glob.sync(require.resolve(modulePath + "/" + json.style)))
    }
  }

  if (_.hasIn(override, "sort")) {
    return [{
      sort: override.sort,
      files
    }]
  }
  if (_.isNumber(override) || _.parseInt(override)) {
    return [{
      sort: _.parseInt(override),
      files
    }]
  }

  return files
}
