'use strict';

var ref = require('ref');
var StructType = require('ref-struct');
var ArrayType = require('ref-array');
var finalize = require('finalize');
var ffi = require('ffi');

module.exports = function (vips) {
    // inherit from GObject fields
    var LayoutOperation = Object.assign(Object.assign({}, 
        vips.LayoutObject), {
        // opaque
    });
    var StructOperation = StructType(LayoutOperation);
    var StructOperationP = ref.refType(StructOperation);

    var VipsOperationFlags = {
        DEPRECATED: 8
    };

    var libgobject = ffi.Library('libgobject-2.0', {
    });

    var libvips = ffi.Library('libvips', {
        vips_operation_new: ['pointer', ['string']],
        vips_argument_map: ['pointer', [StructOperationP, 
            'pointer', 'pointer', 'pointer']],
        vips_operation_get_flags: ['int', [StructOperationP]]

    });

    // used by the unit tests to exercise GObject
    function vips_operation_new(name) {
        return libvips.vips_operation_new(name);
    }

    var Operation = function (name) {
        var vo = libvips.vips_operation_new(name);
        if (vo.isNull()) {
            throw new Error('unknown operation ' + name)
        }

        vips.VipsObject.call(this, vo);

    };

    Operation.prototype = Object.create(vips.VipsObject.prototype);
    Operation.prototype.constructor = Operation;

    Operation.prototype.set = function (field, flags, match_image, value) {
        if (match_image) { 
            var gtype = this.get_typeof(field);

            // if the object wants an image and we have a constant, _imageize it
            //
            // if the object wants an image array, _imageize any constants in the
            // array
            if (gtype == vips.GTYPES.VipsImage) {
                // FIXME ... still to be written
                value = vips.Image.imageize(match_image, value);
            }
            else if (gtype == vips.GTYPES.VipsArrayImage) { 
                value = value.map(function (x) {
                    return vips.Image.imageize(match_image, x);
                });
            }
        }

        // MODIFY args need to be copied before they are set
        if ((flags & vips.VipsArgumentFlags.MODIFY) != 0) { 
            value = value.copy().copy_memory();
        }

        vips.VipsObject.prototype.set.call(this, field, value);
    }

    Operation.prototype.get_flags = function () {
        return libvips.vips_operation_get_flags(this.buffer);
    }

    // horribly slow! call sparingly
    Operation.prototype.get_args = function () {
        var args = [];

        var argument_map_callback = ffi.Callback('pointer',
            [StructOperationP, 
             vips.StructGParamSpecP, 
             vips.StructVipsArgumentClassP, 
             vips.StructVipsArgumentInstanceP, 'pointer', 'pointer'], 
            function (vo, pspec, argument_class, argument_instance, a, b) {
                var name = pspec.deref().name;
                var flags = argument_class.deref().flags;

                if ((flags & vips.VipsArgumentFlags.CONSTRUCT) != 0) {
                    // libvips uses '-' to separate parts of arg names, but we
                    // need '_' for JS
                    name = name.replace(/-/g, '_');

                    args.push([name, flags]);
                }

                return ref.NULL;
            }
        );

        var result = libvips.vips_argument_map(this.buffer, 
            argument_map_callback, ref.NULL, ref.NULL);

        return args;
    };

    function call_args() {
        if (arguments.length < 1 ||
            (typeof arguments[0] != 'string' && 
             !(arguments[0] instanceof String))) {
            throw new Error('first arg to call must be an operation name');
        }
       
        var op = Operation(name);

    }

    function call(/* name, many other args */) {
            call_args.apply(null, arguments);
    }

    vips.vips_operation_new = vips_operation_new;

    vips.Operation = Operation;
    vips.call = call;
};

