"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var glob = require("glob");
var lodash_assignin_1 = require("lodash.assignin");
var lodash_foreach_1 = require("lodash.foreach");
var lodash_hasin_1 = require("lodash.hasin");
function extractNodeModulesPath() {
    var tempPath = require.resolve("glob");
    var indxOfNM = tempPath.lastIndexOf("node_modules");
    return path.resolve(tempPath.substr(0, indxOfNM), "./node_modules");
}
exports.extractNodeModulesPath = extractNodeModulesPath;
function default_1(options) {
    if (options === void 0) { options = {}; }
    var nodeResolved = extractNodeModulesPath();
    var aE = false;
    if (lodash_hasin_1.default(options, "node_modules")) {
        aE = true;
        nodeResolved = path.resolve(options["node_modules"]);
    }
    if (!path.isAbsolute(nodeResolved) || !fs.existsSync(nodeResolved)) {
        throw Error("Unable to find node_modules. " + (aE ? "Check your provided path" : "Specify path manually"));
    }
    var defaultOptions = {
        node_modules: nodeResolved,
        what: "js",
        packageJsonPath: "./package.json"
    };
    options = lodash_assignin_1.default(defaultOptions, (options || {}));
    var buffer = fs.readFileSync(options.packageJsonPath);
    var packages = JSON.parse(buffer.toString());
    var key;
    var keys = [];
    var overrides = packages.overrides || {};
    var override;
    for (key in packages.dependencies) {
        override = lodash_hasin_1.default(overrides, key) ? overrides[key] : {};
        keys = keys.concat(getFiles(options.node_modules + "/" + key, override, options.what));
    }
    return keys;
}
exports.default = default_1;
function getFiles(modulePath, override, what) {
    if (what === void 0) { what = "js"; }
    var packageJsonName = "/package.json";
    var json = JSON.parse(fs.readFileSync(path.join(modulePath, packageJsonName)).toString());
    var files = [];
    if (!override ||
        (what === "js" && override.ignoreJS) ||
        (what === "css" && override.ignoreCSS)) {
        return [];
    }
    if (what === "js") {
        if (typeof override.main === "object") {
            lodash_foreach_1.default(override.main, function (currentMainFile) {
                files = files.concat(glob.sync(path.resolve(modulePath + "/" + currentMainFile)));
            });
        }
        else if (typeof override.main === "string") {
            files = files.concat(glob.sync(path.resolve(modulePath + "/" + override.main)));
        }
        else if (json.main) {
            files = files.concat(glob.sync(path.resolve(modulePath + "/" + json.main)));
        }
    }
    else {
        if (typeof override.style === "object") {
            override.style.forEach(function (currentMainFile) {
                files = files.concat(glob.sync(path.resolve(modulePath + "/" + currentMainFile)));
            });
        }
        else if (typeof override.style === "string") {
            files = files.concat(glob.sync(path.resolve(modulePath + "/" + override.style)));
        }
        else if (json.style) {
            files = files.concat(glob.sync(path.resolve(modulePath + "/" + json.style)));
        }
    }
    return files;
}
