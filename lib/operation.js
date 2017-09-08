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

    var libgobject = ffi.Library('libgobject-2.0', {
    });

    var libvips = ffi.Library('libvips', {
        vips_operation_new: ['pointer', ['string']],

        vips_argument_map: ['pointer', [StructOperationP, 
            'pointer', 'pointer', 'pointer']]

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

    // horribly slow! call sparingly
    Operation.prototype.get_args = function () {
        var args = [];

        var argument_map_callback = ffi.Callback('pointer',
            [StructOperationP, 
             vips.StructGParamSpecP, 
             vips.StructVipsArgumentClassP, 
             vips.StructVipsArgumentInstanceP, 'pointer', 'pointer'], 
            function (vo, pspecp, argument_classp, argument_instancep, a, b) {
                var pspec = pspecp.deref();
                args.push([pspec.name, pspec.flags]);

                return ref.NULL;
            }
        );

        var result = libvips.vips_argument_map(this.buffer, 
            argument_map_callback, ref.NULL, ref.NULL);

        return args;
    };

    vips.vips_operation_new = vips_operation_new;

    vips.Operation = Operation;
};

