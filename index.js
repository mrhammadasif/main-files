"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var glob = require("glob");
var _ = require("lodash");
function extractNodeModulesPath() {
    var tempPath = require.resolve("glob");
    var indxOfNM = tempPath.indexOf("node_modules");
    return path.resolve(tempPath.substr(0, indxOfNM), "./node_modules");
}
exports.extractNodeModulesPath = extractNodeModulesPath;
function default_1(options) {
    if (options === void 0) { options = {}; }
    var nodeResolved = extractNodeModulesPath();
    var aE = false;
    if (_.hasIn(options, "node_modules")) {
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
    options = _.extend(defaultOptions, (options || {}));
    var buffer = fs.readFileSync(options.packageJsonPath);
    var packages = JSON.parse(buffer.toString());
    var key;
    var keys = [];
    var overrides = packages.overrides || {};
    var override;
    for (key in packages.dependencies) {
        override = _.hasIn(overrides, key) ? overrides[key] : {};
        if (!override ||
            override.ignore ||
            (options.what === "js" && override.ignoreJS) ||
            (options.what === "css" && override.ignoreCSS)) {
            continue;
        }
        else {
            keys = keys.concat(getFiles(options.node_modules + "/" + key, override, options.what));
        }
    }
    keys = sortifyKeys(keys);
    keys = normalizeKeys(keys);
    return keys;
}
exports.default = default_1;
function normalizeKeys(keys) {
    var tempKeys = [];
    _.each(keys, function (key) {
        if (_.isArray(key.files)) {
            tempKeys.push.apply(tempKeys, key.files);
        }
        else if (_.hasIn(key, "files")) {
            tempKeys.push(key.files);
        }
    });
    return tempKeys;
}
function sortifyKeys(arr) {
    var sortedKeys = [];
    _.each(arr, function (key, indx) {
        if (_.isObject(key)) {
            sortedKeys.splice(key.sort, 0, key);
        }
        else {
            sortedKeys.splice(sortedKeys.length, 0, {
                sort: arr.length + 1,
                files: [].concat(key)
            });
        }
    });
    sortedKeys = _.sortBy(sortedKeys, "sort");
    return sortedKeys;
}
function getFiles(modulePath, override, what) {
    if (what === void 0) { what = "js"; }
    var packageJsonName = "/package.json";
    var json = JSON.parse(fs.readFileSync(path.join(modulePath, packageJsonName)).toString());
    var files = [];
    if (json.ignore ||
        (what === "js" && json.ignoreJS) ||
        (what === "css" && json.ignoreCSS)) {
        return [];
    }
    if (what === "js") {
        if (typeof override.main === "object") {
            _.each(override.main, function (currentMainFile) {
                files = files.concat(glob.sync(require.resolve(modulePath + "/" + currentMainFile)));
            });
        }
        else if (typeof override.main === "string") {
            files = files.concat(glob.sync(require.resolve(modulePath + "/" + override.main)));
        }
        else if (json.main) {
            files = files.concat(glob.sync(require.resolve(modulePath + "/" + json.main)));
        }
    }
    else {
        if (typeof override.style === "object") {
            override.style.forEach(function (currentMainFile) {
                files = files.concat(glob.sync(require.resolve(modulePath + "/" + currentMainFile)));
            });
        }
        else if (typeof override.style === "string") {
            files = files.concat(glob.sync(require.resolve(modulePath + "/" + override.style)));
        }
        else if (json.style) {
            files = files.concat(glob.sync(require.resolve(modulePath + "/" + json.style)));
        }
    }
    if (_.hasIn(override, "sort")) {
        return [{
                sort: override.sort,
                files: files
            }];
    }
    if (_.isNumber(override) || _.parseInt(override)) {
        return [{
                sort: _.parseInt(override),
                files: files
            }];
    }
    return files;
}
