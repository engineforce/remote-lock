(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["redisRemoteLock"] = factory();
	else
		root["redisRemoteLock"] = factory();
})(global, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./src/index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./src/index.js":
/*!**********************!*\
  !*** ./src/index.js ***!
  \**********************/
/*! exports provided: makeRedisRemoteLock */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _redisRemoteLock__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./redisRemoteLock */ "./src/redisRemoteLock.js");
/* harmony reexport (safe) */ __webpack_require__.d(__webpack_exports__, "makeRedisRemoteLock", function() { return _redisRemoteLock__WEBPACK_IMPORTED_MODULE_0__["makeRedisRemoteLock"]; });




/***/ }),

/***/ "./src/redisRemoteLock.js":
/*!********************************!*\
  !*** ./src/redisRemoteLock.js ***!
  \********************************/
/*! exports provided: makeRedisRemoteLock */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "makeRedisRemoteLock", function() { return makeRedisRemoteLock; });
/* harmony import */ var remote_lock__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! remote-lock */ "remote-lock");
/* harmony import */ var remote_lock__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(remote_lock__WEBPACK_IMPORTED_MODULE_0__);


/**
 *
 * @type {import('..').makeRedisRemoteLock}
 */
const makeRedisRemoteLock = ({
  redis,
  pollingTimeout,
  totalTimeout,
  lockKey: _lockKey,
}) => {
  const lockKey = _lockKey || 'remote.lock.redis'

  return Object(remote_lock__WEBPACK_IMPORTED_MODULE_0__["makeRemoteLock"])({
    getLock: async ({ requestId }) => {
      return new Promise((resolve, reject) => {
        redis.get(
          lockKey,
          /**
           * @param {any} error
           * @param {string} lockValue
           */
          (error, lockValue) => {
            if (error) {
              return reject(error)
            }

            return resolve(lockValue)
          }
        )
      })
    },
    setLock: async ({ requestId, timeout }) => {
      return new Promise((resolve, reject) => {
        redis.set(
          lockKey,
          requestId,
          'EX',
          timeout / 1000,
          /**
           * @param {any} error
           */
          (error) => {
            if (error) {
              return reject(error)
            }

            return resolve()
          }
        )
      })
    },
    releaseLock: async ({ requestId }) => {
      return new Promise((resolve, reject) => {
        redis.del(
          lockKey,
          /**
           * @param {any} error
           */
          (error) => {
            if (error) {
              return reject(error)
            }

            return resolve()
          }
        )
      })
    },
    pollingTimeout,
    totalTimeout,
  })
}


/***/ }),

/***/ "remote-lock":
/*!******************************!*\
  !*** external "remote-lock" ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("remote-lock");

/***/ })

/******/ });
});