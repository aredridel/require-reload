var fs = require('fs');

delete require.cache[module.id]; // Allow ourselves to reload so that parent is correct each time.

module.exports = function requireReload(thing) {
    var backing = {};
    var i;
    var before = [];
    var candidates = [];
    var path;
    var result;
    var replacement;

    for (i in require.cache) {
        before[i] = i;
    }

    result = replacement = module.parent.require(thing);

    applyProxy();

    for (i in require.cache) {
        if (!before[i]) {
            candidates.push(i);
        }
    }

    path = candidates.shift();

    function proxied(element) {
        return function() {
            return backing[element].apply(this, arguments);
        };
    }

    function applyProxy() {
        var i;
        if (typeof replacement == 'function') {
            result = function() {
                return replacement.apply(this, arguments);
            };
        }

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
        replacement = module.parent.require(path);
        applyProxy();
    });

    return result;
};
