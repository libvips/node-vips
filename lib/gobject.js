'use strict';

var ref = require('ref');
var StructType = require('ref-struct');
var ArrayType = require('ref-array');
var finalize = require('finalize');
var ffi = require('ffi');

module.exports = function (vips) {

    var StructGObject = StructType({
        'g_type_instance': 'pointer',
        'ref_count': ref.types.uint,
        'qdata': 'pointer',
    });
    var StructGObjectP = ref.refType(StructGObject);

    var libgobject = ffi.Library('libgobject-2.0', {
        'g_object_ref': ['void', ['pointer']],
        'g_object_unref': ['void', ['pointer']],

    });

    var libvips = ffi.Library('libvips', {
        'vips_operation_new': ['pointer', ['string']],
    });

    // used by the unit tests to exercise GObject
    // FIXME ... remove when we have VipsObject
    function vips_operation_new(name) {
        return libvips.vips_operation_new(name);
    }

    // don't allocate anything, just wrap the pointer from a glib constructor
    // don't _ref the pointer: we steal the constructor's initial ref
    var GObject = function (ptr) {
        this.buffer = ptr;

        finalize(this, function (gv) {
            // FIXME verify this works
            libgobject.g_object_unref(this.buffer);
        });
    };

    GObject.prototype.constructor = GObject;

    GObject.prototype.ref = function () {
        libgobject.g_object_ref(this.buffer);
    };

    GObject.prototype.unref = function () {
        libgobject.g_object_unref(this.buffer);
    };

    vips.GObject = GObject;
    vips.StructGObject = StructGObject;
    vips.StructGObjectP = StructGObjectP;
    vips.vips_operation_new = vips_operation_new;
};

