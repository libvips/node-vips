'use strict';

var ref = require('ref');
var StructType = require('ref-struct');
var ArrayType = require('ref-array');
var finalize = require('finalize');
var ffi = require('ffi');

module.exports = function (vips) {
    // FIXME ... just for testing
    var Image = function (ptr) {
        vips.VipsObject.call(this, ptr);
    }
    Image.prototype = Object.create(vips.VipsObject.prototype);
    Image.prototype.constructor = Image;
    vips.Image = Image;

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
        vips_operation_get_flags: [ref.types.int, [StructOperationP]],
        vips_cache_operation_build: ['pointer', [StructOperationP]],
        vips_object_unref_outputs: [ref.types.void, [StructOperationP]],

        vips_cache_set_max: [ref.types.void, [ref.types.int]],
        vips_cache_set_max_mem: [ref.types.void, [ref.types.size_t]],
        vips_cache_set_max_files: [ref.types.void, [ref.types.int]],
        vips_cache_set_trace: [ref.types.void, [ref.types.int]]

    });

    // used by the unit tests to exercise GObject
    function vips_operation_new(name) {
        return libvips.vips_operation_new(name);
    }

    var Operation = function (arg) {
        console.log("Operation new " + arg);

        var ptr;

        ptr = arg;
        if (typeof arg == 'string' || 
            arg instanceof String) {
            ptr = libvips.vips_operation_new(arg);
            if (ptr.isNull()) {
                throw new Error('unknown operation ' + arg)
            }
        }

        vips.VipsObject.call(this, ptr);
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

    function find_inside(x, fn) {
        if (fn(x)) {
            return x;
        }
        else if (x instanceof Array) {
            for (let i of x) {
                var y = find_inside(i, fn);

                if (y != null)
                    return y;
            }
        }

        return null;
    }

    function call_args() {
        var args = Array.from(arguments);
        console.log("args = " + args);

        if (args.length < 1 ||
            (typeof args[0] != 'string' && 
             !(args[0] instanceof String))) {
            throw new Error('first arg to call must be an operation name');
        }

        var operation_name = args[0];
        var supplied_arguments = args.slice(1, args.length);
        // changed later, see below
        var supplied_optional_arguments = {};

        console.log("operation_name = " + operation_name);
        console.log("supplied_arguments = " + supplied_arguments);
        console.log("supplied_optional_arguments = " + 
            JSON.stringify(supplied_optional_arguments, null, "  "));

        console.log("make " + operation_name + " ...");
        var op = new Operation(operation_name);

        console.log("get args ..." ); 
        var operation_arguments = op.get_args();

        // quickly get flags from name
        var flags_from_name = {};
        for (let x of operation_arguments) {
            var name = x[0];
            var flags = x[1];

            flags_from_name[name] = flags;
        }

        // count required input args
        var n_required = 0;
        for (let x of operation_arguments) {
            var name = x[0];
            var flags = x[1];

            if ((flags & vips.VipsArgumentFlags.INPUT) != 0 &&
                (flags & vips.VipsArgumentFlags.REQUIRED) != 0 &&
                (flags & vips.VipsArgumentFlags.DEPRECATED) == 0) {
                n_required += 1
            }
        }

        // the final supplied argument can be a hash of options
        if (supplied_arguments.length != n_required &&
            supplied_arguments.length != n_required + 1) {
            throw new Error('operation ' + operation_name + ' needs ' +
               n_required + ' arguments, you supplied ' + 
               supplied_arguments.length);
        }
        if (supplied_arguments.length == n_required + 1) {
            var supplied_optional_arguments = supplied_arguments.pop();
        }

        // pull out the special 'string_options' option
        var string_options = '';
        if ('string_options' in supplied_optional_arguments) {
            string_options = supplied_optional_arguments.pop('string_options');
        }

        // the first image argument is the thing we expand constants to
        // match ... look inside tables for images, since we may be passing
        // an array of image as a single param
        var match_image = find_inside(supplied_arguments, (x) => {
            return x instanceof vips.Image;
        });

        // set any string options before any args so they can't be
        // overridden
        console.log("set from string ..." ); 
        op.set_from_string(string_options);

        // set required and optional args
        var n = 0
        for (let x of operation_arguments) { 
            var name = x[0];
            var flags = x[1];

            if ((flags & vips.VipsArgumentFlags.INPUT) != 0 &&
                (flags & vips.VipsArgumentFlags.REQUIRED) != 0 &&
                (flags & vips.VipsArgumentFlags.DEPRECATED) == 0) {
                console.log("set " + name + " = " + supplied_arguments[n]); 
                op.set(name, flags, match_image, supplied_arguments[n])
                n += 1
            }
        }

        for (let name of Object.keys(supplied_optional_arguments)) { 
            var flags = flags_from_name[name];
            var value = supplied_optional_arguments[name];

            console.log("set " + name + " = " + supplied_arguments[n]); 
            op.set(name, flags, match_image, value)
        }

        // build operation
        console.log("building ...");
        var vop = libvips.vips_cache_operation_build(op.buffer);
        if (vop.isNull()) {
            throw new Error('unable to call ' + operation_name);
        }
        op = new Operation(vop)

        // fetch required output args, plus modified input images
        var result = [];
        for (let x of operation_arguments) { 
            var name = x[0];
            var flags = x[1];

            if ((flags & vips.VipsArgumentFlags.OUTPUT) != 0 &&
                (flags & vips.VipsArgumentFlags.REQUIRED) != 0 &&
                (flags & vips.VipsArgumentFlags.DEPRECATED) == 0) {
                var value = op.get(name);
                console.log("get " + name + " = " + value); 
                result.push(value);
            }

            if ((flags & vips.VipsArgumentFlags.INPUT) != 0 &&
                (flags & vips.VipsArgumentFlags.MODIFY) != 0) { 
                var value = op.get(name);
                console.log("get " + name + " = " + value); 
                result.push(value);
            }
        }

        // fetch optional output args
        var opts = {};
        for (let name of Object.keys(supplied_optional_arguments)) { 
            var flags = flags_from_name[name];

            if ((flags & vips.VipsArgumentFlags.OUTPUT) != 0 &&
                (flags & vips.VipsArgumentFlags.REQUIRED) == 0 &&
                (flags & vips.VipsArgumentFlags.DEPRECATED) == 0) {
                var value = op.get(name);
                console.log("get " + name + " = " + value); 
                opts[name] = value;
            }
        }

        console.log("unref outputs ...");
        libvips.vips_object_unref_outputs(op.buffer);

        if (Object.keys(opts).length > 0) {
            result.push(opts)
        }

        if (result.length == 0) {
            result = null;
        }
        else if (result.length == 1) {
            result = result[0]
        }

        console.log("result = " + JSON.stringify(result, null, "  "));

        return result;
    }

    function call(/* name, many other args */) {
            call_args.apply(null, arguments);
    }

    function cache_set_max(max) {
        libvips.vips_cache_set_max(max);
    }

    function cache_set_max_mem(max) {
        libvips.vips_cache_set_max_mem(max);
    }

    function cache_set_max_files(max) {
        libvips.vips_cache_set_max_files(max);
    }

    function cache_set_trace(trace) {
        libvips.vips_cache_set_trace(trace);
    }

    vips.vips_operation_new = vips_operation_new;
    vips.cache_set_max = cache_set_max;
    vips.cache_set_max_mem = cache_set_max_mem;
    vips.cache_set_max_files = cache_set_max_files;
    vips.cache_set_trace = cache_set_trace;

    vips.Operation = Operation;
    vips.call = call;
};
