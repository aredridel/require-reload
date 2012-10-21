requireReload
=============

Usage
-----

    var requireReload = require('requireReload');
    var thing = requireReload('thing');

If the the file that `thing` was loaded from changes, the module it exports will have its properties replaced by the updated copy's.

Caveats
-------

The root object returned does not change. This means that modules that return a
single object are not reloaded.

Functions are wrapped, so that they will call the replaced version.
