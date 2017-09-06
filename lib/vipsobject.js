'use strict';

var ref = require('ref');
var StructType = require('ref-struct');
var ArrayType = require('ref-array');
var finalize = require('finalize');
var ffi = require('ffi');

module.exports = function (vips) {
    // inherit from GObject fields
    var StructVipsObject = StructType(
        Object.assign(Object.assign({}, vips.StructGObject.fields), {
            constructed: ref.types.bool,
            static_object: ref.types.bool,
            argument_table: 'pointer',
            nickname: 'string',
            description: 'string',
            preclose: ref.types.bool,
            close: ref.types.bool,
            postclose: ref.types.bool,
            local_memory: ref.types.size_t,
        })
    );
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

    var StructVipsArgument = StructType({
        pspec: GParamSpec
    });

    var StructVipsArgumentClass = StructType(
        Object.assign(Object.assign({}, StructVipsArgument.fields), {
            object_class: 'pointer',
            flags: 'uint',
            priority: 'int',
            offset: 'uint64',
        })
    );
    var StructVipsArgumentClassP = ref.refType(StructVipsArgumentClass);

    var StructVipsArgumentInstance = StructType(
        Object.assign(Object.assign({}, StructVipsArgument.fields), {
            // opaque
        })
    );
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

    var libgobject = ffi.Library('libgobject-2.0', {
        g_param_spec_get_blurb: ['string', [StructGParamSpecP]],

        vips_object_get_argument: ['int', [
            StructVipsObjectP,
            'string',                       
            ref.refType(StructGParamSpecP),
            ref.refType(StructVipsArgumentClassP),
            ref.refType(StructVipsArgumentInstance)
        ]],
            
        g_object_set_property: ['void', 
            ['pointer', 'string', vips.StructGValueP]],
        g_object_get_property: ['void', 
            ['pointer', 'string', vips.StructGValueP]]
    });

    var libvips = ffi.Library('libvips', {
    });

    var VipsObject = function (ptr) {
        GObject.call(this, ptr);

    };

    VipsObject.prototype = Object.create(GObject.prototype);
    VipsObject.prototype.constructor = VipsObject;

    VipsObject.prototype.get_pspec = function (field) {
        var pspec = ref.alloc(StructGParamSpecP)
        var argument_class = ref.alloc(StructVipsArgumentClassP)
        var argument_instance = ref.alloc(StructVipsArgumentInstance)

        var status = libgobject.vips_object_get_argument(this.buffer, field, 
            pspec.ref(), argument_class.ref(), argument_instance.ref());
        if (status != 0) {
            return ref.NULL;
        }

        return pspec;
    };

    VipsObject.prototype.get_typeof = function (field) {
        var pspec = this.get_pspec(field);
        if (pspec == ffi.NULL) {
            return 0;
        }

        return pspec.value_type;
    }

    VipsObject.prototype.get_typeof_fail = function (field) {
        var gtype = this.get_typeof(field);
        if (gtype == 0) {
            throw new Error('no such field ' + field);
        }

        return gtype;
    }

    VipsObject.prototype.get = function (field) {
        var gtype = this.get_typeof_fail(field);
        var gv = new vips.GValue();
        gv.init(gtype)
        libgobject.g_object_get_property(this.buffer, field, gv.buffer);

        return gv.get();
    };

    VipsObject.prototype.set = function (field, value) {
        var gtype = this.get_typeof_fail(field);
        var gv = new vips.GValue();
        gv.init(gtype);
        gv.set(value);
        libgobject.g_object_set_property(this.buffer, field, gv.buffer.ref());
    };

    vips.VipsObject = VipsObject;
};

