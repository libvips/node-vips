'use strict';

var ref = require('ref');
var StructType = require('ref-struct');
var ArrayType = require('ref-array');
var ffi = require('ffi');
var weak = require('weak');

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
          gtype: GType,
          data: ArrayType('uint64', 2)
    });
    var StructGValueP = ref.refType(StructGValue);
    var SizeP = ref.refType('size_t');

    var libglib = ffi.Library('libglib-2.0', {
        g_free: ['void', ['pointer']],
        g_malloc: ['pointer', ['size_t']],
        g_memdup: ['pointer', ['pointer', 'size_t']]
    });

    // g_free() as a calllback we can pass to funcs ... sadly it seems we have
    // to bounce via JS, we can't just use a C func
    var g_free = ffi.Callback('void', ['pointer'], (p) => {libglib.g_free(p);});

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

        g_value_get_boolean: ['bool', [StructGValueP]],
        g_value_get_int: ['int', [StructGValueP]],
        g_value_get_double: ['double', [StructGValueP]],
        g_value_get_enum: ['int', [StructGValueP]],
        g_value_get_flags: ['int', [StructGValueP]],
        g_value_get_string: ['string', [StructGValueP]],
        g_value_get_object: ['pointer', [StructGValueP]]
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
    var ArrayByte = ArrayType('uint8');
    var ArrayInt = ArrayType('int');
    var ArrayDouble = ArrayType('double');
    var ArrayPointer = ArrayType('pointer');

    var libvips = ffi.Library('libvips', {
        vips_enum_nick: ['string', [GType, 'int']],
        vips_enum_from_nick: ['int', ['string', GType, 'string']],

        vips_value_set_array_double: ['void', 
            [StructGValueP, ArrayDouble, 'int']],
        vips_value_set_array_int: ['void', [StructGValueP, ArrayInt, 'int']],
        vips_value_set_array_image: ['void', [StructGValueP, 'int']],
        vips_value_set_blob: ['void', 
            [StructGValueP, 'pointer', 'pointer', 'int']],

        vips_value_get_ref_string: ['string', [StructGValueP, SizeP]],
        vips_value_get_array_double: [ArrayDouble, [StructGValueP, IntP]],
        vips_value_get_array_int: [ArrayInt, [StructGValueP, IntP]],
        vips_value_get_array_image: [ArrayPointer, [StructGValueP, IntP]],
        vips_value_get_blob: ['pointer', [StructGValueP, SizeP]],

        vips_interpretation_get_type: ['void', []],
        vips_operation_flags_get_type: ['void', []],
        vips_band_format_get_type: ['void', []],

        vips_type_find: [GType, ['string', 'string']],
        vips_nickname_find: ['string', [GType]],
        vips_type_map: ['pointer', [GType, 'pointer']]

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
    ].forEach((name) => {GTYPES[name] = type_from_name(name);});

    // string to an enum value (int) ready for libvips
    function to_enum(gtype, value) {
        var enum_value;

        if (typeof value == 'string' || value instanceof String) {
            enum_value = libvips.vips_enum_from_nick('node-vips', gtype, value);

            if (enum_value < 0) {
                throw new vips.VipsError('no such enum ' + value + '\n' + 
                    object.get_error());
            }
        }
        else {
            enum_value = value;
        }

        return enum_value;
    }

    // int enum value back to a string ready for JS
    function from_enum(gtype, enum_value) {
        var value = libvips.vips_enum_nick(gtype, enum_value)
        if (value == ref.NULL) {
            throw new vips.VipsError('value not in enum')
        }

        return value;
    }

    var GValue = function () {
        // we must init to zero
        var struct = new StructGValue();
        struct.gtype = 0;
        struct.data[0] = 0;
        struct.data[1] = 0;

        this.buffer = struct;

        // we keep the finalize closure in the GValue, with a weakref from
        // itself 
        this.finalize = function () {
            // console.log("GValue.finalize: unset 0x" + 
            //      struct.ref().address().toString(16));
            libgobject.g_value_unset(struct.ref());
        }
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
            result = libvips.vips_value_get_ref_string(this.buffer.ref(), 
                ref.NULL);
            break;

        case GTYPES.VipsImage:
            // g_value_get_object() will not add a ref ... that is
            // held by the gvalue
            var vo = libgobject.g_value_get_object(this.buffer.ref());

            // we want a ref that will last with the life of the vimage: 
            // this ref is matched by the unref that's attached to finalize
            // by GObject
            result = new vips.Image(vo);
            result.object_ref();
            break;

        case GTYPES.VipsArrayInt:
            var len_buf = ref.alloc('int');
            var array = libvips.vips_value_get_array_int(this.buffer.ref(), 
                len_buf);
            var len = len_buf.deref();
            array.length = len;

            result = []
            for (var i = 0; i < len; i++) { 
                result[i] = array[i];
            }
            break;

        case GTYPES.VipsArrayDouble:
            var len_buf = ref.alloc('int');
            var array = libvips.vips_value_get_array_double(this.buffer.ref(), 
                len_buf);
            var len = len_buf.deref();
            array.length = len;

            result = []
            for (var i = 0; i < len; i++) { 
                result[i] = array[i];
            }
            break;

        case GTYPES.VipsArrayImage:
            var len_buf = ref.alloc('int');
            var array = libvips.vips_value_get_array_image(this.buffer.ref(), 
                len_buf.ref());
            var len = len_buf.deref();
            array.length = len;

            result = []
            for (var i = 0; i < len; i++) { 
                result[i] = new vips.Image(array[i]);
            }
            break;

        case GTYPES.VipsBlob:
            var size_buf = ref.alloc('size_t');
            var ptr = libvips.vips_value_get_blob(this.buffer.ref(), size_buf);
            var size = size_buf.deref();

            // we know blob is really size bytes
            var blob = ref.reinterpret(ptr, size);

            // copy to a fresh area of memory controlled by node
            result = new Buffer(blob);

            break;

        default:
            switch (fundamental) {
            case GTYPES.GEnum:
                var enum_value = libgobject.g_value_get_enum(this.buffer.ref())
                var result = from_enum(gtype, enum_value);
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

    GValue.prototype.get_typeof = function () {
        return this.buffer.gtype;
    };

    GValue.prototype.set = function (value) {
        var gtype = this.buffer.gtype;
        var fundamental = libgobject.g_type_fundamental(gtype);

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

            var array = new ArrayInt(value);
            libvips.vips_value_set_array_int(this.buffer.ref(), 
                array, array.length);
            break;

        case GTYPES.VipsArrayDouble:
            if (!(value instanceof Array)) {
                value = [value];
            }

            var array = new ArrayDouble(value);
            libvips.vips_value_set_array_double(this.buffer.ref(), 
                array, value.length)
            break;

        case GTYPES.VipsArrayImage:
            if (!(value instanceof Array)) {
                value = [value];
            }

            libvips.vips_value_set_array_image(this.buffer.ref(), value.length);
            var array = libvips.vips_value_get_array_image(this.buffer.ref(), 
                ref.NULL);
            array.length = value.length;

            for (var i = 0; i < value.length; i++) {
                array[i] = value[i].buffer;

                // the gvalue needs a set of refs to own
                value[i].object_ref();
            }

            break;

        case GTYPES.VipsBlob:
            // make a buffer we can take the address of
            var buf = new Buffer(value);

            // dup into a fresh memory area we can give to glib
            var ptr = libglib.g_memdup(buf, buf.length);
            var blob = ref.reinterpret(ptr, buf.length);

            libvips.vips_value_set_blob(this.buffer.ref(), 
                g_free, blob, buf.length);
            break;

        default:
            switch (fundamental) {
            case GTYPES.GEnum:
                libgobject.g_value_set_enum(this.buffer.ref(), 
                    to_enum(gtype, value));
                break;

            case GTYPES.GFlags:
                libgobject.g_value_set_flags(this.buffer.ref(), value);
                break;

            case GTYPES.GObject:
                if (!(value instanceof vips.GObject)) {
                    throw new Error('can\'t set an object value with ' + value);
                }
                libgobject.g_value_set_object(this.buffer.ref(), value.buffer)
                break;

            default:
                throw new Error('unimplemented gtype in set()');
            }
        }
    };

    // Get the GType for a name.
    function type_find(basename, nickname) {
        return libvips.vips_type_find(basename, nickname);
    }

    // Get the nickname for a GType.
    function nickname_find(gtype) {
        return libvips.vips_nickname_find(gtype);
    }

    // Map fn over all child types of gtype.
    function type_map(gtype, fn) {
        var cb = ffi.Callback('pointer', [GType], fn);

        return libvips.vips_type_map(gtype, cb);
    }

    // everything we export
    vips.GType = GType;
    vips.StructGValue = StructGValue;
    vips.StructGValueP = StructGValueP;
    vips.g_free = g_free;

    vips.type_name = type_name;
    vips.type_from_name = type_from_name;
    vips.type_fundamental = type_fundamental;
    vips.to_enum = to_enum;
    vips.from_enum = from_enum;
    vips.GTYPES = GTYPES;

    vips.GValue = GValue;

    vips.type_find = type_find;
    vips.nickname_find = nickname_find;
    vips.type_map = type_map;

};
