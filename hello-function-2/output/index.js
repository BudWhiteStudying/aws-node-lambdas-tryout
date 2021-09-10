"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = function (event, context, callback) {
    console.log("Executing the event handler");
    callback(null, { statusCode: 200, body: JSON.stringify({ message: "Hello F2" }) });
};
