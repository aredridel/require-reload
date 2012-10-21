var fs = require('fs');

module.exports = function requireReload(module) {
    var path = require.resolve(module);
    var result = require(module);
    var watcher = fs.watchFile(path, function reload(curr, prev) {
        if (curr.mtime == prev.mtime) return;
        delete require.cache[module];
        var replacement = require(module);
        var i;
        for (i in replacement) result[i] = replacement[i];
        for (i in result) if (typeof replacement[i] == 'undefined') delete result[i];
    });
    return result;
}
