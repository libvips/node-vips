'use strict';

var ref = require('ref');
var StructType = require('ref-struct');
var ArrayType = require('ref-array');
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

    var Operation = function (ptr) {
        vips.VipsObject.call(this, ptr);
    };

    Operation.prototype = Object.create(vips.VipsObject.prototype);
    Operation.prototype.constructor = Operation;

    // usage: 
    //      var op = vips.Operation.new_from_name('black');
    Operation.new_from_name = function (name) {
        var vo = libvips.vips_operation_new(name);
        if (vo.isNull()) {
            throw new Error('unknown operation ' + name)
        }

        return new Operation(vo);
    }

    Operation.prototype.set = function (field, flags, match_image, value) {
        if (match_image) { 
            var gtype = this.get_typeof(field);

            // if the object wants an image and we have a constant, _imageize it
            //
            // if the object wants an image array, _imageize any constants in the
            // array
            if (gtype == vips.GTYPES.VipsImage) {
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
        if (args.length < 1 ||
            (typeof args[0] != 'string' && 
             !(args[0] instanceof String))) {
            throw new Error('first arg to call must be an operation name');
        }

        var operation_name = args[0];
        var supplied_arguments = args.slice(1, args.length);
        // changed later, see below
        var supplied_optional_arguments = {};

        // console.log("operation_name = " + operation_name);
        // console.log("supplied_arguments = " + supplied_arguments);
        // console.log("supplied_optional_arguments = " + 
            // JSON.stringify(supplied_optional_arguments, null, "  "));

        var op = Operation.new_from_name(operation_name);

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
            string_options = supplied_optional_arguments['string_options'];
            delete supplied_optional_arguments['string_options'];
        }

        // the first image argument is the thing we expand constants to
        // match ... look inside tables for images, since we may be passing
        // an array of image as a single param
        var match_image = find_inside(supplied_arguments, (x) => {
            return x instanceof vips.Image;
        });

        // set any string options before any args so they can't be
        // overridden
        op.set_from_string(string_options);

        // set required and optional args
        var n = 0
        for (let x of operation_arguments) { 
            var name = x[0];
            var flags = x[1];

            if ((flags & vips.VipsArgumentFlags.INPUT) != 0 &&
                (flags & vips.VipsArgumentFlags.REQUIRED) != 0 &&
                (flags & vips.VipsArgumentFlags.DEPRECATED) == 0) {
                // console.log("set " + name + " = " + supplied_arguments[n]); 
                op.set(name, flags, match_image, supplied_arguments[n])
                n += 1
            }
        }

        for (let name of Object.keys(supplied_optional_arguments)) { 
            var flags = flags_from_name[name];
            var value = supplied_optional_arguments[name];

            // console.log("set " + name + " = " + value); 
            op.set(name, flags, match_image, value)
        }

        // build operation
        // console.log("building ...");
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
                // console.log("get " + name + " = " + value); 
                result.push(value);
            }

            if ((flags & vips.VipsArgumentFlags.INPUT) != 0 &&
                (flags & vips.VipsArgumentFlags.MODIFY) != 0) { 
                var value = op.get(name);
                // console.log("get " + name + " = " + value); 
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
                // console.log("get " + name + " = " + value); 
                opts[name] = value;
            }
        }

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

        // console.log("result = " + JSON.stringify(result, null, "  "));

        return result;
    }

    // Generate a single wrapper for a gtype.
    function generate_wrapper(nickname) {
        var op = Operation.new_from_name(nickname);
        if (op.get_flags() & VipsOperationFlags.DEPRECATED) {
            return;
        }

        var operation_arguments = op.get_args();

        // only interested in non-deprecated args
        var args = [];
        for (let x of operation_arguments) { 
            var name = x[0];
            var flags = x[1];

            if ((flags & vips.VipsArgumentFlags.DEPRECATED) == 0) {
                args.push(x);
            }
        }
        operation_arguments = args;

        // find the first required input image arg, if any ... that will be 
        // this
        var member_x = undefined;
        for (let x of operation_arguments) { 
            var name = x[0];
            var flags = x[1];

            if ((flags & vips.VipsArgumentFlags.INPUT) != 0 &&
                (flags & vips.VipsArgumentFlags.REQUIRED) != 0 &&
                op.get_typeof(name) == vips.GTYPES.VipsImage) {
                member_x = name;
                break;
            }
        }

        // all other required inputs
        var required_input = [];
        for (let x of operation_arguments) { 
            var name = x[0];
            var flags = x[1];

            if ((flags & vips.VipsArgumentFlags.INPUT) != 0 &&
                (flags & vips.VipsArgumentFlags.REQUIRED) != 0 &&
                name != member_x) {
                // rename to avoid clashes with "in" keyword
                if (name == "in") {
                    name = "input";
                }

                required_input.push(name);
            }
        }

        // there's always an options at the end
        required_input.push('options');

        var result;

        result = '';

        result += 'vips.Image.';
        if (member_x) {
            result += 'prototype.';
        }
        result += nickname + ' = function (';
        result += required_input.join(', ');
        result += ') {\n';
        result += '    options = typeof options !== \'undefined\' ? ';
        result += 'options : {};\n';
        result += '    ';
        result += 'return vips.call(\'' + nickname + '\', ';
        if (member_x) {
            required_input.unshift('this');
        }
        result += required_input.join(', ');
        result += ');\n';
        result += '};\n';
        
        return result;
    }

    /* Aim to generate wrappers like this:
     *
     * Image.prototype.embed = function (left, top, width, height, options) {
     *     options = typeof options !== 'undefined' ? options : {};
     *
     *     return vips.call('embed', this, left, top, width, height, options);
     * }
     *
     * Class members (ie. no image arg) are just missing "prototype" and "this".
     *
     * We could generate docs too, see generate_sphinx() in 
     * pyvips/pyvips/voperation.py.
     */
    function generate_wrappers() {
        // various operators need hand-written bindings to be convenient to use
        var banned = [
            'bandrank',
            'bandjoin',
            'ifthenelse',
            'add',
            'subtract',
            'multiply',
            'divide'
        ];

        var wrapper_of = {};
        function add_docs(gtype) {
            var nickname = vips.nickname_find(gtype);
            if (banned.indexOf(nickname) == -1) {
                try {
                    var str = generate_wrapper(nickname);
                    wrapper_of[nickname] = str;
                }
                catch (err) {
                }

                vips.type_map(gtype, add_docs);
            }

            return ref.NULL;
        }

        vips.type_map(vips.type_from_name('VipsOperation'), add_docs);

        for (let nickname of Object.keys(wrapper_of).sort()) {
            console.log(wrapper_of[nickname]);
            console.log(''); 
        }

    }

    function call(/* name, many other args */) {
            return call_args.apply(null, arguments);
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

    vips.generate_wrapper = generate_wrapper;
    vips.generate_wrappers = generate_wrappers;
};

