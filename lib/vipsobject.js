'use strict';

// We'd normally drop the "Vips" prefix for this class, but calling it Object
// would just be too confusing

var ref = require('ref');
var StructType = require('ref-struct');
var ffi = require('ffi');

module.exports = function (vips) {
  // inherit from GObject fields
  var LayoutVipsObject = Object.assign(Object.assign({}, vips.LayoutGObject), {
    constructed: ref.types.bool,
    static_object: ref.types.bool,
    argument_table: 'pointer',
    nickname: 'string',
    description: 'string',
    preclose: ref.types.bool,
    close: ref.types.bool,
    postclose: ref.types.bool,
    local_memory: ref.types.size_t
  });
  var StructVipsObject = StructType(LayoutVipsObject);
  var StructVipsObjectP = ref.refType(StructVipsObject);

  var StructGParamSpec = StructType({
    // just the first few public fields
    g_type_instance: 'pointer',
    name: 'string',
    flags: ref.types.uint,
    value_type: vips.GType,
    owner_type: vips.GType
  });
  var StructGParamSpecP = ref.refType(StructGParamSpec);

  var LayoutVipsArgument = {
    pspec: StructGParamSpecP
  };

  var StructVipsArgumentClass = StructType(
        Object.assign(Object.assign({}, LayoutVipsArgument), {
          object_class: 'pointer',
          flags: ref.types.uint,
          priority: ref.types.int,
          offset: ref.types.uint64
        })
    );
  var StructVipsArgumentClassP = ref.refType(StructVipsArgumentClass);

  var StructVipsArgumentInstance = StructType(Object.assign(Object.assign({}, LayoutVipsArgument), {
    // opaque
  }));
  var StructVipsArgumentInstanceP = ref.refType(StructVipsArgumentInstance);

  var VipsArgumentFlags = {
    NONE: 0,
    REQUIRED: 1,
    CONSTRUCT: 2,
    SET_ONCE: 4,
    SET_ALWAYS: 8,
    INPUT: 16,
    OUTPUT: 32,
    DEPRECATED: 64,
    MODIFY: 128
  };

  // TODO: Windows needs libgobject-2.0-0
  var libgobject = ffi.Library('libgobject-2.0', {
    g_object_set_property: ['void', ['pointer', 'string', vips.StructGValueP]],
    g_object_get_property: ['void', ['pointer', 'string', vips.StructGValueP]]
  });

  // TODO: Windows needs libvips-42
  var libvips = ffi.Library('libvips', {
    vips_object_get_argument: ['int', [
      StructVipsObjectP,
      'string',
      ref.refType(StructGParamSpecP),
      ref.refType(StructVipsArgumentClassP),
      ref.refType(StructVipsArgumentInstance)
    ]],
    vips_object_set_from_string: ['int', ['pointer', 'string']],
    vips_object_get_description: ['string', ['pointer']]

  });

  var VipsObject = function (ptr) {
    vips.GObject.call(this, ptr);
  };

  VipsObject.prototype = Object.create(vips.GObject.prototype);
  VipsObject.prototype.constructor = VipsObject;

  VipsObject.prototype.getPspec = function (field) {
    var pspecp = ref.alloc(StructGParamSpecP);
    var argumentClassp = ref.alloc(StructVipsArgumentClassP);
    var argumentInstancep = ref.alloc(StructVipsArgumentInstanceP);

    var status = libvips.vips_object_get_argument(this.buffer, field,
            pspecp, argumentClassp, argumentInstancep);
    if (status !== 0) {
      return 0;
    }

    return pspecp.deref().deref();
  };

  VipsObject.prototype.getTypeOf = function (field) {
    var pspec = this.getPspec(field);
    if (pspec === 0) {
      vips.errorClear();
      return 0;
    }

    return pspec.value_type;
  };

  VipsObject.prototype.getTypeOfFail = function (field) {
    var gtype = this.getTypeOf(field);
    if (gtype === 0) {
      throw new vips.VipsError('no such field ' + field);
    }

    return gtype;
  };

  VipsObject.prototype.get = function (field) {
    var gtype = this.getTypeOfFail(field);
    var gv = new vips.GValue();
    gv.init(gtype);
    libgobject.g_object_get_property(this.buffer, field, gv.buffer.ref());

    return gv.get();
  };

  VipsObject.prototype.set = function (field, value) {
    var gtype = this.getTypeOfFail(field);
    var gv = new vips.GValue();
    gv.init(gtype);
    gv.set(value);
    libgobject.g_object_set_property(this.buffer, field, gv.buffer.ref());

    // we must have this extra, operation on gv or we could
    // get a GC between gv.set and g_object_set_property which would unset
    // the gvalue ... this just keeps gv alive until after ffi is done
    gv.getTypeOf();
  };

  VipsObject.prototype.setFromString = function (stringOptions) {
    var result = libvips.vips_object_set_from_string(this.buffer, stringOptions);
    if (result !== 0) {
      throw new vips.VipsError('unable to set options ' + stringOptions);
    }
  };

  vips.LayoutVipsObject = LayoutVipsObject;
  vips.StructGParamSpec = StructGParamSpec;
  vips.StructGParamSpecP = StructGParamSpecP;
  vips.StructVipsArgumentClass = StructVipsArgumentClass;
  vips.StructVipsArgumentClassP = StructVipsArgumentClassP;
  vips.StructVipsArgumentInstance = StructVipsArgumentInstance;
  vips.StructVipsArgumentInstanceP = StructVipsArgumentInstanceP;
  vips.VipsArgumentFlags = VipsArgumentFlags;

  vips.VipsObject = VipsObject;
};
