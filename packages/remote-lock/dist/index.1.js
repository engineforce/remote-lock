// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"ZxkV":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeRemoteLock = void 0;

/**
 * @type {import("..").makeRemoteLock}
 */
const makeRemoteLock = ({
  getLock: _getLock,
  setLock: _setLock,
  releaseLock: _releaseLock,
  pollingTimeout: _pollingTimeout,
  totalTimeout: _totalTimeout
}) => {
  return async ({
    requestId,
    exec,
    skipLock,
    pollingTimeout,
    totalTimeout
  }) => {
    console.assert(requestId != undefined, 'Lock ID is empty.');
    pollingTimeout = pollingTimeout || _pollingTimeout || 1000;
    totalTimeout = totalTimeout || _totalTimeout || 60000;
    let hasLock = false;

    try {
      hasLock = await pollForLock({
        getLock: _getLock,
        setLock: _setLock,
        requestId,
        pollingTimeout,
        skipLock,
        totalTimeout
      });
      return exec({
        hasLock
      });
    } finally {
      if (hasLock) {
        await _releaseLock({
          requestId
        });
      }
    }
  };
};
/**
 * @param {object} input
 * @param {(input: import("..").IGetLockInput) => Promise<string>} input.getLock
 * @param {(input: import("..").ISetLockInput) => Promise<void>} input.setLock
 * @param {() => Promise<boolean>=} input.skipLock
 * @param {string} input.requestId
 * @param {number} input.pollingTimeout
 * @param {number} input.totalTimeout
 */


exports.makeRemoteLock = makeRemoteLock;

async function pollForLock({
  pollingTimeout,
  totalTimeout,
  skipLock,
  requestId,
  getLock,
  setLock
}) {
  let count = 0;
  let hasLock = false;
  const startTime = new Date().getTime();

  while (true) {
    count++;

    if (typeof skipLock === 'function' && count > 1) {
      if (await skipLock()) {
        break;
      }
    }

    const currentTime = new Date().getTime();

    if (currentTime - startTime > totalTimeout) {
      throw new Error(`Failed to obtain lock after ${totalTimeout} ms.`);
    }

    const currentRequestId = await getLock({
      requestId
    });

    if (currentRequestId == undefined) {
      await setLock({
        requestId,
        timeout: totalTimeout
      });
      continue;
    }

    if (currentRequestId == requestId) {
      hasLock = true;
      break;
    }

    await new Promise(resolve => setTimeout(resolve, pollingTimeout));
  }

  return hasLock;
}
},{}],"Focm":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _remoteLock = require("./remoteLock");

Object.keys(_remoteLock).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _remoteLock[key];
    }
  });
});
},{"./remoteLock":"ZxkV"}]},{},["Focm"], null)