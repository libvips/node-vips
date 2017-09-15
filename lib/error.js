'use strict';

var util = require('util');
var ffi = require('ffi');

module.exports = function (vips) {
  // TODO: Windows needs libvips-42
  var libvips = ffi.Library('libvips', {
    vips_error_buffer: ['string', []],
    vips_error_clear: ['void', []]
  });

  var errorBuffer = function () {
    return libvips.vips_error_buffer();
  };

  var errorClear = function () {
    libvips.vips_error_clear();
  };

  var VipsError = function (message) {
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.vipsMessage = errorBuffer();
    errorClear();
    this.message = message + '\n' + this.vipsMessage;
  };

  util.inherits(VipsError, Error);

  vips.VipsError = VipsError;
  vips.errorClear = errorClear;
};
