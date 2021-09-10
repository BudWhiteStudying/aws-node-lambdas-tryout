/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it uses a non-standard name for the exports (exports).
(() => {
var exports = __webpack_exports__;

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.handler = void 0;
const handler = async () => {
    return { body: JSON.stringify({ message: 'Hello F1' }), statusCode: 200 };
};
exports.handler = handler;

})();

module.exports = __webpack_exports__;
/******/ })()
;