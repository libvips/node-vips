'use strict';

var util = require('util');
var ffi = require('ffi');

module.exports = function (vips) {

    // TODO: Windows needs libvips-42
    var libvips = ffi.Library('libvips', {
        vips_error_buffer: ['string', []],
        vips_error_clear: ['void', []]
    });

    vips.VipsError = function (message) {
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.vips_message = libvips.vips_error_buffer();
        libvips.vips_error_clear();
        this.message = message + '\n' + this.vips_message;
    };

    util.inherits(vips.VipsError, Error);

};
