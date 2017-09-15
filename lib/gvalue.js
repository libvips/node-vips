'use strict';

var ref = require('ref');
var StructType = require('ref-struct');
var ArrayType = require('ref-array');
var ffi = require('ffi');
var weak = require('weak');

module.exports = function (vips) {
  // we can't just use ulong, windows has different int sizing rules
  var GType;
  if (ref.sizeof.pointer === 8) {
    GType = ref.types.uint64;
  } else {
    GType = ref.types.uint32;
  }

  var StructGValue = StructType({
    gtype: GType,
    data: ArrayType('uint64', 2)
  });
  var StructGValueP = ref.refType(StructGValue);
  var SizeP = ref.refType('size_t');

  // TODO: Windows needs libgobject-2.0-0
  var libgobject = ffi.Library('libgobject-2.0', {
    g_type_name: ['string', [GType]],
    g_type_from_name: [GType, ['string']],
    g_type_fundamental: [GType, [GType]],

    g_value_init: ['void', [StructGValueP, GType]],
    g_value_unset: ['void', [StructGValueP]],

    g_value_set_boolean: ['void', [StructGValueP, 'bool']],
    g_value_set_int: ['void', [StructGValueP, 'int']],
    g_value_set_double: ['void', [StructGValueP, 'double']],
    g_value_set_enum: ['void', [StructGValueP, 'int']],
    g_value_set_flags: ['void', [StructGValueP, 'int']],
    g_value_set_string: ['void', [StructGValueP, 'string']],
    g_value_set_object: ['void', [StructGValueP, 'pointer']],
    g_value_set_boxed: ['void', [StructGValueP, 'pointer']],

    g_value_get_boolean: ['bool', [StructGValueP]],
    g_value_get_int: ['int', [StructGValueP]],
    g_value_get_double: ['double', [StructGValueP]],
    g_value_get_enum: ['int', [StructGValueP]],
    g_value_get_flags: ['int', [StructGValueP]],
    g_value_get_string: ['string', [StructGValueP]],
    g_value_get_object: ['pointer', [StructGValueP]]
  });

  function typeName (gtype) {
    return libgobject.g_type_name(gtype);
  }

  function typeFromName (name) {
    return libgobject.g_type_from_name(name);
  }

  function typeFundamental (gtype) {
    return libgobject.g_type_fundamental(gtype);
  }

  var IntP = ref.refType('int');
  var ArrayInt = ArrayType('int');
  var ArrayDouble = ArrayType('double');
  var ArrayPointer = ArrayType('pointer');

  // TODO: Windows needs libvips-42
  var libvips = ffi.Library('libvips', {
    vips_interpretation_get_type: ['void', []],
    vips_operation_flags_get_type: ['void', []],
    vips_band_format_get_type: ['void', []],

    vips_enum_nick: ['string', [GType, 'int']],
    vips_enum_from_nick: ['int', ['string', GType, 'string']],
    vips_type_find: [GType, ['string', 'string']],
    vips_nickname_find: ['string', [GType]],
    vips_type_map: ['pointer', [GType, 'pointer']],

    vips_value_set_array_double: ['void',
            [StructGValueP, ArrayDouble, 'int']],
    vips_value_set_array_int: ['void', [StructGValueP, ArrayInt, 'int']],
    vips_value_set_array_image: ['void', [StructGValueP, 'int']],
    vips_value_set_blob: ['void',
            [StructGValueP, 'pointer', 'pointer', 'int']],
    vips_blob_copy: ['pointer', ['pointer', 'size_t']],
    vips_area_unref: ['void', ['pointer']],

    vips_value_get_ref_string: ['string', [StructGValueP, SizeP]],
    vips_value_get_array_double: [ArrayDouble, [StructGValueP, IntP]],
    vips_value_get_array_int: [ArrayInt, [StructGValueP, IntP]],
    vips_value_get_array_image: [ArrayPointer, [StructGValueP, IntP]],
    vips_value_get_blob: ['pointer', [StructGValueP, SizeP]]

  });

  // used by unit tests
  libvips.vips_interpretation_get_type();
  libvips.vips_operation_flags_get_type();
  libvips.vips_band_format_get_type();

  // some useful GTypes
  var GTYPES = {};
  [
    'gboolean',
    'gint',
    'gdouble',
    'gchararray',
    'GEnum',
    'GFlags',
    'GObject',
    'VipsImage',
    'VipsArrayInt',
    'VipsArrayDouble',
    'VipsArrayImage',
    'VipsRefString',
    'VipsBlob',
    'VipsInterpretation',
    'VipsOperationFlags',
    'VipsBandFormat'
  ].forEach((name) => {
    GTYPES[name] = typeFromName(name);
  });

  // string to an enum value (int) ready for libvips
  function toEnum (gtype, value) {
    var enumValue;

    if (typeof value === 'string' || value instanceof String) {
      enumValue = libvips.vips_enum_from_nick('node-vips', gtype, value);

      if (enumValue < 0) {
        throw new vips.VipsError('no such enum ' + value);
      }
    } else {
      enumValue = value;
    }

    return enumValue;
  }

    // int enum value back to a string ready for JS
  function fromEnum (gtype, enumValue) {
    var value = libvips.vips_enum_nick(gtype, enumValue);
    if (value === ref.NULL) {
      throw new vips.VipsError('value not in enum');
    }

    return value;
  }

  // Get the GType for a name.
  function typeFind (basename, nickname) {
    return libvips.vips_type_find(basename, nickname);
  }

  // Get the nickname for a GType.
  function nicknameFind (gtype) {
    return libvips.vips_nickname_find(gtype);
  }

  // Map fn over all child types of gtype.
  function typeMap (gtype, fn) {
    var cb = ffi.Callback('pointer', [GType], fn);

    return libvips.vips_type_map(gtype, cb);
  }

  // debugging: track number of buffers awaiting a free callback from libvips
  vips.nValues = 0;

  var GValue = function () {
    // we must init to zero
    var struct = new StructGValue();
    struct.gtype = 0;
    struct.data[0] = 0;
    struct.data[1] = 0;

    this.buffer = struct;

    vips.nValues += 1;

    // we keep the finalize closure in the GValue, with a weakref from
    // itself
    this.finalize = function () {
      // console.log("GValue.finalize: unset 0x" +
      //      struct.ref().address().toString(16));
      libgobject.g_value_unset(struct.ref());
      vips.nValues -= 1;
    };
    weak(this, this.finalize);
  };

  GValue.prototype.constructor = GValue;

  GValue.prototype.init = function (gtype) {
    libgobject.g_value_init(this.buffer.ref(), gtype);
  };

  GValue.prototype.get = function () {
    var gtype = this.buffer.gtype;
    var fundamental = libgobject.g_type_fundamental(gtype);

    var result;
    var vo, lenBuf, array, len, sizeBuf, size, ptr, blob, enumValue;

    switch (gtype) {
      case GTYPES.gboolean:
        result = libgobject.g_value_get_boolean(this.buffer.ref());
        break;

      case GTYPES.gint:
        result = libgobject.g_value_get_int(this.buffer.ref());
        break;

      case GTYPES.gdouble:
        result = libgobject.g_value_get_double(this.buffer.ref());
        break;

      case GTYPES.gchararray:
        result = libgobject.g_value_get_string(this.buffer.ref());
        break;

      case GTYPES.VipsRefString:
        // don't bother getting the size -- assume these are always
        // null-terminated C strings
        result = libvips.vips_value_get_ref_string(this.buffer.ref(), ref.NULL);
        break;

      case GTYPES.VipsImage:
        // g_value_get_object() will not add a ref ... that is
        // held by the gvalue
        vo = libgobject.g_value_get_object(this.buffer.ref());

        // we want a ref that will last with the life of the vimage:
        // this ref is matched by the unref that's attached to finalize
        // by GObject
        result = new vips.Image(vo);
        result.objectRef();
        break;

      case GTYPES.VipsArrayInt:
        lenBuf = ref.alloc('int');
        array = libvips.vips_value_get_array_int(this.buffer.ref(), lenBuf);
        len = lenBuf.deref();
        array.length = len;

        result = [];
        for (let i = 0; i < len; i++) {
          result[i] = array[i];
        }
        break;

      case GTYPES.VipsArrayDouble:
        lenBuf = ref.alloc('int');
        array = libvips.vips_value_get_array_double(this.buffer.ref(), lenBuf);
        len = lenBuf.deref();
        array.length = len;

        result = [];
        for (let i = 0; i < len; i++) {
          result[i] = array[i];
        }
        break;

      case GTYPES.VipsArrayImage:
        lenBuf = ref.alloc('int');
        array = libvips.vips_value_get_array_image(this.buffer.ref(),
                    lenBuf.ref());
        len = lenBuf.deref();
        array.length = len;

        result = [];
        for (let i = 0; i < len; i++) {
          result[i] = new vips.Image(array[i]);
        }
        break;

      case GTYPES.VipsBlob:
        sizeBuf = ref.alloc('size_t');
        ptr = libvips.vips_value_get_blob(this.buffer.ref(), sizeBuf);
        size = sizeBuf.deref();

        // we know blob is really size bytes
        blob = ref.reinterpret(ptr, size);

        // copy to a fresh area of memory controlled by node
        result = Buffer.from(blob);

        break;

      default:
        switch (fundamental) {
          case GTYPES.GEnum:
            enumValue = libgobject.g_value_get_enum(this.buffer.ref());
            result = fromEnum(gtype, enumValue);
            break;

          case GTYPES.GFlags:
            result = libgobject.g_value_get_flags(this.buffer.ref());
            break;

          default:
            throw new Error('unimplemented gtype in get()');
        }
    }

    return result;
  };

  GValue.prototype.getTypeOf = function () {
    return this.buffer.gtype;
  };

  GValue.prototype.set = function (value) {
    var gtype = this.buffer.gtype;
    var fundamental = libgobject.g_type_fundamental(gtype);

    var array, buf, blob;

    switch (gtype) {
      case GTYPES.gboolean:
        libgobject.g_value_set_boolean(this.buffer.ref(), value);
        break;

      case GTYPES.gint:
        libgobject.g_value_set_int(this.buffer.ref(), value);
        break;

      case GTYPES.gdouble:
        libgobject.g_value_set_double(this.buffer.ref(), value);
        break;

      case GTYPES.gchararray:
      case GTYPES.VipsRefString:
        libgobject.g_value_set_string(this.buffer.ref(), value);
        break;

      case GTYPES.VipsArrayInt:
        if (!(value instanceof Array)) {
          value = [value];
        }

        array = new ArrayInt(value);
        libvips.vips_value_set_array_int(this.buffer.ref(), array, array.length);
        break;

      case GTYPES.VipsArrayDouble:
        if (!(value instanceof Array)) {
          value = [value];
        }

        array = new ArrayDouble(value);
        libvips.vips_value_set_array_double(this.buffer.ref(),
                    array, value.length);
        break;

      case GTYPES.VipsArrayImage:
        if (!(value instanceof Array)) {
          value = [value];
        }

        libvips.vips_value_set_array_image(this.buffer.ref(),
                    value.length);
        array = libvips.vips_value_get_array_image(this.buffer.ref(), ref.NULL);
        array.length = value.length;

        for (let i = 0; i < value.length; i++) {
          array[i] = value[i].buffer;

          // the gvalue needs a set of refs to own
          value[i].objectRef();
        }

        break;

      case GTYPES.VipsBlob:
        // copy to a buffer if it's not one already ... this is
        // necessary for strings, for example
        if (Buffer.isBuffer(value)) {
          buf = value;
        } else {
          buf = Buffer.from(value);
        }

        // we can't really use vips_value_set_blob() because
        // - node-ffi seems not to allow us to pass C functions
        //   directly as pointers
        // - the free callback of set_blob should be g_free(), but we
        //   can't pass that, so we need to pass in a JS callback which
        //   in turn triggers g_free()
        // - on a GC, we can end up many layers deep in JS/C/JS and
        //   deadlock happens
        // - and of course g_free() as a Callback is slow
        //
        // instead, use vips_blob_copy() and assign the gvalue boxed
        // ourselves

        // FIXME ... we could avoid this copy if libvips could somehow
        // keep a strong ref to a node object, not clear if this is
        // possible

        // copy the buffer into a new VipsBlob
        blob = libvips.vips_blob_copy(buf, buf.length);

        // and set that as the value of the gvalue with set_boxed
        libgobject.g_value_set_boxed(this.buffer.ref(), blob);
        libvips.vips_area_unref(blob);
        break;

      default:
        switch (fundamental) {
          case GTYPES.GEnum:
            libgobject.g_value_set_enum(this.buffer.ref(), toEnum(gtype, value));
            break;

          case GTYPES.GFlags:
            libgobject.g_value_set_flags(this.buffer.ref(), value);
            break;

          case GTYPES.GObject:
            if (!(value instanceof vips.GObject)) {
              throw new Error('can\'t set object type with ' + value);
            }
            libgobject.g_value_set_object(this.buffer.ref(), value.buffer);
            break;

          default:
            throw new Error('unimplemented gtype in set()');
        }
    }
  };

  // everything we export
  vips.GType = GType;
  vips.StructGValue = StructGValue;
  vips.StructGValueP = StructGValueP;

  vips.typeName = typeName;
  vips.typeFromName = typeFromName;
  vips.typeFundamental = typeFundamental;
  vips.toEnum = toEnum;
  vips.fromEnum = fromEnum;
  vips.GTYPES = GTYPES;

  vips.GValue = GValue;

  vips.typeFind = typeFind;
  vips.nicknameFind = nicknameFind;
  vips.typeMap = typeMap;
};
