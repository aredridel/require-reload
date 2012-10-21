var fs = require('fs');

module.exports = function requireReload(thing) {
    var backing = {};
    var i;
    var before = [];
    var candidates = [];
    var path;
    var result;

    for (i in require.cache) {
        before[i] = i;
    }

    result = module.parent.require(thing);

    applyProxy(result, result);

    for (i in require.cache) {
        if (!before[i]) {
            candidates.push(i);
        }
    }

    if (candidates.length == 1) {
        path = candidates.shift();
    } else {
        path = candidates.shift();
        console.log('I hope',  path, 'was the right one, not one of', candidates);
    }

    function proxied(element) {
        return function() {
            return backing[element].apply(this, arguments);
        }
    }

    function applyProxy(target, replacement) {
        var i;
        for (i in replacement) {
            if (typeof replacement[i] == 'function') {
                backing[i] = replacement[i];
                result[i] = proxied(i);
            } else {
                result[i] = replacement[i];
            }
        }
        for (i in result) {
            if (typeof replacement[i] == 'undefined') {
                delete result[i];
                delete backing[i];
            }
        }
    }

    var watcher = fs.watchFile(path, function reload(curr, prev) {
        if (curr.mtime == prev.mtime) return;
        console.log("reloading", path);
        delete require.cache[path];
        var replacement = module.parent.require(path);
        applyProxy(result, replacement);
    });

    return result;
}
