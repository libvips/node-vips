'use strict';

var ref = require('ref');
var StructType = require('ref-struct');
var ffi = require('ffi');

module.exports = function (vips) {
    // inherit from GObject fields
    var LayoutInterpolate = Object.assign(Object.assign({},
        vips.LayoutObject), {
        // opaque
    });
    var StructInterpolate = StructType(LayoutInterpolate);
    var StructInterpolateP = ref.refType(StructInterpolate);

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
    Interpolate.new_from_name = function (name) {
        var vi = libvips.vips_interpolate_new(name);
        if (vi.isNull()) {
            throw new vips.VipsError('unknown interpolator ' + name)
        }

        return new Interpolate(vi);
    };

    vips.Interpolate = Interpolate;
};

