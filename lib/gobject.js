'use strict';

var ref = require('ref');
var StructType = require('ref-struct');
var weak = require('weak');
var ffi = require('ffi');

module.exports = function (vips) {
  var LayoutGObject = {
    g_type_instance: 'pointer',
    ref_count: ref.types.uint,
    qdata: 'pointer'
  };
  var StructGObject = StructType(LayoutGObject);
  var StructGObjectP = ref.refType(StructGObject);

  // TODO: Windows needs libgobject-2.0-0
  var libgobject = ffi.Library('libgobject-2.0', {
    g_object_ref: ['void', ['pointer']],
    g_object_unref: ['void', ['pointer']]
  });

  // handy for debugging
  vips.n_objects = 0;

  // don't allocate anything, just wrap the pointer from a glib constructor
  // don't _ref the pointer: we steal the constructor's initial ref
  var GObject = function (ptr) {
    this.buffer = ptr;
    vips.n_objects += 1;

    this.finalize = function () {
      // console.log("GObject.finalize: ptr = " +
      //    JSON.stringify(ptr, null, "  "));
      libgobject.g_object_unref(ptr);
      vips.n_objects -= 1;
    };
    weak(this, this.finalize);
  };

  GObject.prototype.constructor = GObject;

  // call it object_ref to avoid confusion with ref
  GObject.prototype.object_ref = function () {
    libgobject.g_object_ref(this.buffer);
  };

  GObject.prototype.object_unref = function () {
    libgobject.g_object_unref(this.buffer);
  };

  vips.LayoutGObject = LayoutGObject;
  vips.StructGObject = StructGObject;
  vips.StructGObjectP = StructGObjectP;

  vips.GObject = GObject;
};
