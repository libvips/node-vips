'use strict';

var ffi = require('ffi');

module.exports = function (vips) {
  // TODO: Windows needs libvips-42
  var libvips = ffi.Library('libvips', {
    vips_interpolate_new: ['pointer', ['string']]

  });

  var Interpolate = function (ptr) {
    vips.VipsObject.call(this, ptr);
  };

  Interpolate.prototype = Object.create(vips.VipsObject.prototype);
  Interpolate.prototype.constructor = Interpolate;

  // usage:
  //      var interp = vips.Interpolate.new_from_name('black');
  Interpolate.newFromName = function (name) {
    var vi = libvips.vips_interpolate_new(name);
    if (vi.isNull()) {
      throw new vips.VipsError('unknown interpolator ' + name);
    }

    return new Interpolate(vi);
  };

  vips.Interpolate = Interpolate;
};
