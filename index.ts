import * as fs from "fs"
import * as path from "path"
import * as glob from "glob"
import * as extend from "lodash.assignin"
import * as each from "lodash.foreach"
import * as hasin from "lodash.hasin"

// hack function to extract the node_modules folder name
export function extractNodeModulesPath () {
  const tempPath = require.resolve("glob")
  const indxOfNM = tempPath.lastIndexOf("node_modules")
  return path.resolve(tempPath.substr(0, indxOfNM), "./node_modules")
}

export default function (options: any = {}) {
  let nodeResolved = extractNodeModulesPath()
  let aE = false

  if (hasin(options, "node_modules")) {
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
  options = extend(defaultOptions, (options || {}))

  let buffer = fs.readFileSync(options.packageJsonPath)
  let packages = JSON.parse(buffer.toString())
  let key
  let keys = []
  const overrides = packages.overrides || {}
  let override

  for (key in packages.dependencies) {
    override = hasin(overrides, key) ? overrides[key] : {}
    keys = keys.concat(getFiles(options.node_modules + "/" + key, override, options.what))
  }

  return keys
}

function getFiles(modulePath, override, what = "js") {
  const packageJsonName = "/package.json"
  const json = JSON.parse(fs.readFileSync(path.join(modulePath, packageJsonName)).toString())
  let files = []

  if (
    !override ||
    (what === "js" && override.ignoreJS) ||
    (what === "css" && override.ignoreCSS)
  ) {
    return []
  }
  if (what === "js") {
    if (typeof override.main === "object") {
      each(override.main, currentMainFile => {
        files = files.concat(glob.sync(path.resolve(modulePath + "/" + currentMainFile)))
      })
    }
    else if (typeof override.main === "string") {
      files = files.concat(glob.sync(path.resolve(modulePath + "/" + override.main)))
    }
    else if (json.main) {
      files = files.concat(glob.sync(path.resolve(modulePath + "/" + json.main)))
    }
  }
  else {
    if (typeof override.style === "object") {
      override.style.forEach( currentMainFile => {
        files = files.concat(glob.sync(path.resolve(modulePath + "/" + currentMainFile)))
      })
    }
    else if (typeof override.style === "string") {
      files = files.concat(glob.sync(path.resolve(modulePath + "/" + override.style)))
    }
    else if (json.style) {
      files = files.concat(glob.sync(path.resolve(modulePath + "/" + json.style)))
    }
  }

  // TODO: return files according to the sort number
  // if (hasin(override, "sort")) {
  //   return [{
  //     sort: override.sort,
  //     files
  //   }]
  // }

  return files
}
