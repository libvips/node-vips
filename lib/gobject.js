'use strict';

var ref = require('ref');
var StructType = require('ref-struct');
var ArrayType = require('ref-array');
var finalize = require('finalize');
var ffi = require('ffi');

module.exports = function (vips) {

    var StructGObject = StructType({
        'g_type_instance': ref.types.pointer,
        'ref_count': ref.types.uint,
        'qdata': ref.types.pointer
    )};
    var StructGObjectP = ref.refType(StructGObject);

    var StructGParamSpec = StructType({
        // just the first few public fields
        'g_type_instance': ref.types.pointer,
        'name': 'string',
        'flags': ref.types.uint,
        'value_type': vips.GType,
        'owner_type': vips.GType
    )};
    var StructGParamSpecP = ref.refType(StructGParamSpec);

    var libgobject = ffi.Library('libgobject-2.0', {
        'g_param_spec_get_blurb': ['string', [StructGParamSpecP]],
        'g_object_ref': ['void', ['pointer']],
        'g_object_unref': ['void', ['pointer']],
        'g_object_set_property': ['void', 
            ['pointer', 'string', vips.StructGValueP]],
        'g_object_get_property': ['void', 
            ['pointer', 'string', vips.StructGValueP]]
    });

    // don't allocate anything, just wrap the pointer from a glib constructor
    // don't _ref the pointer: we steal the constructors initial ref
    var GObject = function (ptr) {
        this.buffer = ptr;

        finalize(this, function (gv) {
            // FIXME verify this works
            libgobject.g_object_unref(this.buffer.ref());
        });
    };

    GObject.prototype.constructor = GObject;

    GObject.prototype.ref = function () {
        libgobject.g_object_ref(this.buffer.ref());
    };

    GObject.prototype.unref = function () {
        libgobject.g_object_unref(this.buffer.ref());
    };

    GObject.prototype.get = function (field) {
        var gv = new vips.GValue();
        libgobject.g_object_get_property(this.buffer.ref(), 
            field, gv.buffer.ref());

        return gv.get();
    };

    GObject.prototype.get_typeof = function (field) {
        var gv = new vips.GValue();
        libgobject.g_object_get_property(this.buffer.ref(), 
            field, gv.buffer.ref());

        return gv.get_typeof();
    };

    GObject.prototype.set = function (field, value) {
        var gv = new vips.GValue();
        gv.init(this.get_typeof(field));
        gv.set(value);
        libgobject.g_object_set_property(this.buffer.ref(), 
            field, gv.buffer.ref());
    };

    vips.GObject = GObject;
};

