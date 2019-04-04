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
 * @param {object} input
 * @param {(input: IGetLockInput) => Promise<string>} input.getLock
 * @param {(input: ISetLockInput) => Promise<void>} input.setLock
 * @param {(input: IReleaseLockInput) => Promise<void>} input.releaseLock
 * @param {number=} input.pollingTimeout
 * @param {number=} input.totalTimeout
 */
const makeRemoteLock = ({
  getLock: _getLock,
  setLock: _setLock,
  releaseLock: _releaseLock,
  pollingTimeout: _pollingTimeout,
  totalTimeout: _totalTimeout
}) => {
  return (
    /**
     * @param {object} input
     * @param {string} input.lockId
     * @param {(input: IExecInput) => Promise<any>} input.exec
     * @param {() => Promise<boolean>=} input.skipLock
     * @param {number=} input.pollingTimeout
     * @param {number=} input.totalTimeout
     */
    async ({
      lockId,
      exec,
      skipLock,
      pollingTimeout,
      totalTimeout
    }) => {
      console.assert(lockId != undefined, 'Lock ID is empty.');
      pollingTimeout = pollingTimeout || _pollingTimeout || 1000;
      totalTimeout = totalTimeout || _totalTimeout || 60000;
      let hasLock = false;

      try {
        hasLock = await pollForLock({
          getLock: _getLock,
          setLock: _setLock,
          lockId,
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
            lockId
          });
        }
      }
    }
  );
};
/**
 * @param {object} input
 * @param {(input: IGetLockInput) => Promise<string>} input.getLock
 * @param {(input: ISetLockInput) => Promise<void>} input.setLock
 * @param {() => Promise<boolean>=} input.skipLock
 * @param {string} input.lockId
 * @param {number} input.pollingTimeout
 * @param {number} input.totalTimeout
 */


exports.makeRemoteLock = makeRemoteLock;

async function pollForLock({
  pollingTimeout,
  totalTimeout,
  skipLock,
  lockId,
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

    const currentLockId = await getLock({
      lockId
    });

    if (currentLockId == undefined) {
      await setLock({
        lockId,
        timeout: totalTimeout
      });
      continue;
    }

    if (currentLockId == lockId) {
      hasLock = true;
      break;
    }

    await new Promise(resolve => setTimeout(resolve, pollingTimeout));
  }

  return hasLock;
}
/**
 * @typedef {object} IGetLockInput
 * @property {string} lockId
 *
 * @typedef {object} ISetLockInput
 * @property {string} lockId
 * @property {number} timeout - timeout in ms
 *
 * @typedef {object} IReleaseLockInput
 * @property {string} lockId
 *
 * @typedef {object} IExecInput
 * @property {boolean} hasLock
 */
},{}],"Q2Cg":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.makeRedisLock = void 0;

var _v = _interopRequireDefault(require("uuid/v4"));

var _remoteLock = require("./remoteLock");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * @param {object} input
 * @param {*} input.redis
 * @param {number=} input.pollingTimeout
 * @param {number=} input.totalTimeout
 * @param {string=} input.lockIdPrefix
 */
const makeRedisLock = ({
  redis,
  pollingTimeout,
  totalTimeout,
  lockIdPrefix
}) => {
  lockIdPrefix = lockIdPrefix || 'remote.lock.redis';
  return (0, _remoteLock.makeRemoteLock)({
    getLock: async () => {
      return redis.get(lockIdPrefix);
    },
    setLock: async ({
      lockId,
      timeout
    }) => {
      return redis.set(lockIdPrefix, lockId, 'EX', timeout / 1000);
    },
    releaseLock: async () => {
      return redis.del(lockIdPrefix);
    },
    pollingTimeout,
    totalTimeout
  });
};

exports.makeRedisLock = makeRedisLock;
},{"./remoteLock":"ZxkV"}],"Focm":[function(require,module,exports) {
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

var _redisLock = require("./redisLock");

Object.keys(_redisLock).forEach(function (key) {
  if (key === "default" || key === "__esModule") return;
  Object.defineProperty(exports, key, {
    enumerable: true,
    get: function () {
      return _redisLock[key];
    }
  });
});
},{"./remoteLock":"ZxkV","./redisLock":"Q2Cg"}]},{},["Focm"], "remoteLock")