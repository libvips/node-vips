'use strict';

var ref = require('ref');
var StructType = require('ref-struct');
var ArrayType = require('ref-array');
var finalize = require('finalize');
var ffi = require('ffi');

module.exports = function (vips) {
    // we can't just use ulong, windows has different int sizing rules
    var GType;
    if (ref.sizeof.pointer == 8) {
        GType = ref.types.uint64;
    }
    else {
        GType = ref.types.uint32;
    }

    var StructGValue = StructType({
          'gtype': GType,
          // FIXME ... ugly! how do you declare uint64[2] with ArrayType?
          'data0': ref.types.uint64, 
          'data1': ref.types.uint64
    })
    var StructGValueP = ref.refType(StructGValue);
    var SizeP = ref.refType('size_t');

    var libgobject = ffi.Library('libgobject-2.0', {
        'g_type_name': ['string', [GType]],
        'g_type_from_name': [GType, ['string']],
        'g_type_fundamental': [GType, [GType]],

        'g_value_init': ['void', [StructGValueP, GType]],
        'g_value_unset': ['void', [StructGValueP]],

        'g_value_set_boolean': ['void', [StructGValueP, 'bool']],
        'g_value_set_int': ['void', [StructGValueP, 'int']],
        'g_value_set_double': ['void', [StructGValueP, 'double']],
        'g_value_set_enum': ['void', [StructGValueP, 'int']],
        'g_value_set_flags': ['void', [StructGValueP, 'int']],
        'g_value_set_string': ['void', [StructGValueP, 'string']],
        'g_value_set_object': ['void', [StructGValueP, 'pointer']],

        'g_value_get_boolean': ['bool', [StructGValueP]],
        'g_value_get_int': ['int', [StructGValueP]],
        'g_value_get_double': ['double', [StructGValueP]],
        'g_value_get_enum': ['int', [StructGValueP]],
        'g_value_get_flags': ['int', [StructGValueP]],
        'g_value_get_string': ['string', [StructGValueP]],
        'g_value_get_object': ['pointer', [StructGValueP]]

    });

    function type_name(gtype) {
        return libgobject.g_type_name(gtype);
    }

    function type_from_name(name) {
        return libgobject.g_type_from_name(name);
    }

    function type_fundamental(gtype) {
        return libgobject.g_type_fundamental(gtype);
    }

    var IntP = ref.refType('int');
    var DoubleP = ref.refType('double');
    var ArrayInt = ArrayType('int');
    var ArrayDouble = ArrayType('double');
    var ArrayPointer = ArrayType('pointer');

    var libvips = ffi.Library('libvips', {
        'vips_enum_nick': ['string', [GType, 'int']],
        'vips_enum_from_nick': ['int', ['string', GType, 'string']],

        'vips_value_set_array_double': ['void', 
            [StructGValueP, ArrayDouble, 'int']],
        'vips_value_set_array_int': ['void', [StructGValueP, ArrayInt, 'int']],
        'vips_value_set_array_image': ['void', [StructGValueP, 'int']],
        // 'vips_value_set_array_blob': ['void', 
        //     [StructGValueP, free_callback, 'pointer', 'int']],

        'vips_value_get_ref_string': ['string', [StructGValueP, SizeP]],
        'vips_value_get_array_double': [ArrayDouble, [StructGValueP, IntP]],
        'vips_value_get_array_int': [ArrayInt, [StructGValueP, IntP]],
        'vips_value_get_array_image': [ArrayPointer, [StructGValueP, IntP]],
        'vips_value_get_blob': ['pointer', [StructGValueP, SizeP]]

    });

    var GTYPES = {
        'gbool': type_from_name('gboolean'),
        'gint': type_from_name('gint'),
        'gdouble': type_from_name('gdouble'),
        'gstr': type_from_name('gchararray'),
        'genum': type_from_name('GEnum'),
        'gflags': type_from_name('GFlags'),
        'image': type_from_name('VipsImage'),
        'array_int': type_from_name('VipsArrayInt'),
        'array_double': type_from_name('VipsArrayDouble'),
        'array_image': type_from_name('VipsArrayImage'),
        'refstr': type_from_name('VipsRefString'),
        'blob': type_from_name('VipsBlob')
    }

    var GValue = function () {
        this.buffer = new StructGValue();
        // not inited to zero
        this.buffer.gtype = 0;
        this.buffer.data0 = 0;
        this.buffer.data1 = 0;

        finalize(this, function (gv) {
            // FIXME verify this works
            libgobject.g_value_unset(this.buffer.ref());
        });
    };

    GValue.prototype.constructor = GValue;

    GValue.prototype.init = function (gtype) {
        libgobject.g_value_init(this.buffer.ref(), gtype);
    };

    GValue.prototype.get = function () {
        var gtype = this.buffer.gtype;
        var fundamental = libgobject.g_type_fundamental(gtype);

        var result;

        switch (gtype) {
        case GTYPES.gbool:
            result = libgobject.g_value_get_boolean(this.buffer.ref());
            break;

        case GTYPES.gint:
            result = libgobject.g_value_get_int(this.buffer.ref());
            break;

        case GTYPES.gdouble:
            result = libgobject.g_value_get_double(this.buffer.ref());
            break;

        case GTYPES.gstr:
            result = libgobject.g_value_get_string(this.buffer.ref());
            break;

        case GTYPES.refstr:
            // don't bother getting the size -- assume these are always
            // null-terminated C strings
            result = libvips.vips_value_get_ref_string(this.buffer.ref(), 
                ref.NULL);
            break;

        case GTYPES.image:
                /* FIXME ... patch this Lua code
                 *
            -- g_value_get_object() will not add a ref ... that is
            -- held by the gvalue
            local vo = gobject.g_value_get_object(gv)
            local vimage = ffi.cast(gvalue.image_typeof, vo)

            -- we want a ref that will last with the life of the vimage: 
            -- this ref is matched by the unref that's attached to finalize
            -- by Image.new() 
            gobject.g_object_ref(vimage)
            result = Image.new(vimage)
                 *
                 */
            break;

        case GTYPES.array_int:
            var len_buf = ref.alloc('int');
            var array = libvips.vips_value_get_array_int(this.buffer.ref(), 
                len_buf);
            var len = len_buf.deref();

            result = []
            for (var i = 0; i < len; i++) { 
                result[i] = array[i];
            }
            break;

        case GTYPES.array_double:
            var len_buf = ref.alloc('int');
            var array = libvips.vips_value_get_array_double(this.buffer.ref(), 
                len_buf);
            var len = len_buf.deref();

            result = []
            for (var i = 0; i < len; i++) { 
                result[i] = array[i];
            }
            break;

        case GTYPES.array_image:
            var len_buf = ref.alloc('int');
            var array_p = libvips.vips_value_get_array_image(this.buffer.ref(), 
                len_buf.ref());
            var array = array_p.deref();
            var len = len_buf.deref();

            result = []
            for (var i = 0; i < len; i++) { 
                // FIXME .. need to wrap an Image around the raw pointer
                result[i] = array[i];
            }
            break;

        case GTYPES.blob:
            var size_buf = ref.alloc('size_t');
            var blob = vips.vips_value_get_blob(this.buffer.ref(), 
                size_buf.ref())
            result = new Buffer(size_buf.deref());
            // FIXME ... need to copy from the libvips memory area into the JS
            // buffer object
            break;

        default:
            switch (fundamental) {
            case GTYPES.genum:
                var enum_value = libgobject.g_value_get_enum(this.buffer.ref())

                var result = libvips.vips_enum_nick(gtype, enum_value)
                if (result.isNull()) {
                    // FIXME
                    // use the vips error throw
                    throw new Error('value not in enum')
                }
                break;

            case GTYPES.gflags:
                result = libgobject.g_value_get_flags(this.buffer.ref());
                break;

            default:
                throw new Error('unimplemented gtype in get()');
            }
        }

        return result;
    };

    GValue.prototype.get_typeof = function () {
        return this.buffer.gtype;
    };

    GValue.prototype.set = function (value) {
        var gtype = this.buffer.gtype;
        var fundamental = libgobject.g_type_fundamental(gtype);

        switch (gtype) {
        case GTYPES.gbool:
            libgobject.g_value_set_boolean(this.buffer.ref(), value);
            break;

        case GTYPES.gint:
            libgobject.g_value_set_int(this.buffer.ref(), value);
            break;

        case GTYPES.gdouble:
            libgobject.g_value_set_double(this.buffer.ref(), value);
            break;

        case GTYPES.gstr:
        case GTYPES.refstr:
            libgobject.g_value_set_string(this.buffer.ref(), value);
            break;

        case GTYPES.image:
            // FIXME check that value is an image object
            libgobject.g_value_set_object(this.buffer.ref(), value.buffer.ref())
            break;

        case GTYPES.array_int:
            if (!(value instanceof Array)) {
                value = [value];
            }

            var array = new ArrayInt(value);
            libvips.vips_value_set_array_int(this.buffer.ref(), array, 
                value.length);
            break;

        case GTYPES.array_double:
            if (!(value instanceof Array)) {
                value = [value];
            }

            var array = new ArrayDouble(value);
            libvips.vips_value_set_array_double(this.buffer.ref(), 
                array, value.length)
            break;

        case GTYPES.array_image:
            if (!(value instanceof Array)) {
                value = [value];
            }

            libvips.vips_value_set_array_image(this.buffer.ref(), value.length);
            var array_p = libvips.vips_value_get_array_image(this.buffer.ref(), 
                ref.NULL);
            var array = array_p.deref();

            for (var i = 0; i < value.length; i++) {
                array[i] = value[i].buffer.ref();

                // the gvalue needs a set of refs to own
                gobject.g_object_ref(array[i]);
            }

            break;

        case GTYPES.blob:
            // FIXME
            // we need to set the gvalue to a copy of value that libvips can own
            break;

        default:
            switch (fundamental) {
            case GTYPES.genum:
                if (typeof value == 'string' || 
                    value instanceof String) {
                    enum_value = libvips.vips_enum_from_nick('node-vips', 
                        gtype, value);

                    if (enum_value < 0) {
                        // FIXME
                        // something to throw a vips error
                        throw new Error('no such enum ' + value + '\n' + 
                            object.get_error());
                    }
                }
                else {
                    enum_value = value;
                }

                libgobject.g_value_set_enum(this.buffer.ref(), enum_value);
                break;

            case GTYPES.gflags:
                libgobject.g_value_set_flags(this.buffer.ref(), value);
                break;

            default:
                throw new Error('unimplemented gtype in set()');
            }
        }
    };

    // everything we export
    vips.GType = GType;
    vips.StructGValueP = StructGValueP;

    vips.type_name = type_name;
    vips.type_from_name = type_from_name;
    vips.type_fundamental = type_fundamental;
    vips.GTYPES = GTYPES;

    vips.GValue = GValue;

};
