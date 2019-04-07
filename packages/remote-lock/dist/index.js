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

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

/**
 * @type {import("..").makeRemoteLock}
 */
var makeRemoteLock = function makeRemoteLock(_ref) {
  var _getLock = _ref.getLock,
      _setLock = _ref.setLock,
      _releaseLock = _ref.releaseLock,
      _pollingTimeout = _ref.pollingTimeout,
      _totalTimeout = _ref.totalTimeout;
  return (
    /*#__PURE__*/
    function () {
      var _ref3 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(_ref2) {
        var requestId, exec, skipLock, pollingTimeout, totalTimeout, hasLock;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                requestId = _ref2.requestId, exec = _ref2.exec, skipLock = _ref2.skipLock, pollingTimeout = _ref2.pollingTimeout, totalTimeout = _ref2.totalTimeout;
                console.assert(requestId != undefined, 'Lock ID is empty.');
                pollingTimeout = pollingTimeout || _pollingTimeout || 1000;
                totalTimeout = totalTimeout || _totalTimeout || 60000;
                hasLock = false;
                _context.prev = 5;
                _context.next = 8;
                return pollForLock({
                  getLock: _getLock,
                  setLock: _setLock,
                  requestId: requestId,
                  pollingTimeout: pollingTimeout,
                  skipLock: skipLock,
                  totalTimeout: totalTimeout
                });

              case 8:
                hasLock = _context.sent;
                return _context.abrupt("return", exec({
                  hasLock: hasLock
                }));

              case 10:
                _context.prev = 10;

                if (!hasLock) {
                  _context.next = 14;
                  break;
                }

                _context.next = 14;
                return _releaseLock({
                  requestId: requestId
                });

              case 14:
                return _context.finish(10);

              case 15:
              case "end":
                return _context.stop();
            }
          }
        }, _callee, null, [[5,, 10, 15]]);
      }));

      return function (_x) {
        return _ref3.apply(this, arguments);
      };
    }()
  );
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

function pollForLock(_x2) {
  return _pollForLock.apply(this, arguments);
}

function _pollForLock() {
  _pollForLock = _asyncToGenerator(
  /*#__PURE__*/
  regeneratorRuntime.mark(function _callee2(_ref4) {
    var pollingTimeout, totalTimeout, skipLock, requestId, getLock, setLock, count, hasLock, startTime, currentTime, currentRequestId;
    return regeneratorRuntime.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            pollingTimeout = _ref4.pollingTimeout, totalTimeout = _ref4.totalTimeout, skipLock = _ref4.skipLock, requestId = _ref4.requestId, getLock = _ref4.getLock, setLock = _ref4.setLock;
            count = 0;
            hasLock = false;
            startTime = new Date().getTime();

          case 4:
            if (!true) {
              _context2.next = 28;
              break;
            }

            count++;

            if (!(typeof skipLock === 'function' && count > 1)) {
              _context2.next = 11;
              break;
            }

            _context2.next = 9;
            return skipLock();

          case 9:
            if (!_context2.sent) {
              _context2.next = 11;
              break;
            }

            return _context2.abrupt("break", 28);

          case 11:
            currentTime = new Date().getTime();

            if (!(currentTime - startTime > totalTimeout)) {
              _context2.next = 14;
              break;
            }

            throw new Error("Failed to obtain lock after ".concat(totalTimeout, " ms."));

          case 14:
            _context2.next = 16;
            return getLock({
              requestId: requestId
            });

          case 16:
            currentRequestId = _context2.sent;

            if (!(currentRequestId == undefined)) {
              _context2.next = 21;
              break;
            }

            _context2.next = 20;
            return setLock({
              requestId: requestId,
              timeout: totalTimeout
            });

          case 20:
            return _context2.abrupt("continue", 4);

          case 21:
            if (!(currentRequestId == requestId)) {
              _context2.next = 24;
              break;
            }

            hasLock = true;
            return _context2.abrupt("break", 28);

          case 24:
            _context2.next = 26;
            return new Promise(function (resolve) {
              return setTimeout(resolve, pollingTimeout);
            });

          case 26:
            _context2.next = 4;
            break;

          case 28:
            return _context2.abrupt("return", hasLock);

          case 29:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2);
  }));
  return _pollForLock.apply(this, arguments);
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
},{"./remoteLock":"ZxkV"}]},{},["Focm"], "remoteLock")