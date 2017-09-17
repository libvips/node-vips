'use strict';

var ref = require('ref');
var StructType = require('ref-struct');
var ffi = require('ffi');

module.exports = function (vips) {
  // inherit from GObject fields
  var LayoutOperation = Object.assign(Object.assign({}, vips.LayoutObject), {
    // opaque
  });
  var StructOperation = StructType(LayoutOperation);
  var StructOperationP = ref.refType(StructOperation);

  var VipsOperationFlags = {
    DEPRECATED: 8
  };

  // TODO: Windows needs libvips-42
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
  function vipsOperationNew (name) {
    return libvips.vips_operation_new(name);
  }

  var Operation = function (ptr) {
    vips.VipsObject.call(this, ptr);
  };

  Operation.prototype = Object.create(vips.VipsObject.prototype);
  Operation.prototype.constructor = Operation;

  // usage:
  //      var op = vips.Operation.newFromName('black');
  Operation.newFromName = function (name) {
    var vo = libvips.vips_operation_new(name);
    if (vo.isNull()) {
      throw new vips.VipsError('unknown operation ' + name);
    }

    return new Operation(vo);
  };

  Operation.prototype.set = function (field, flags, matchImage, value) {
    if (matchImage) {
      var gtype = this.getTypeOf(field);

      // if the object wants an image and we have a constant, imageize it
      //
      // if the object wants an image array, imageize any constants in the
      // array
      if (gtype === vips.GTYPES.VipsImage) {
        value = vips.Image.imageize(matchImage, value);
      } else if (gtype === vips.GTYPES.VipsArrayImage) {
        value = value.map((x) => vips.Image.imageize(matchImage, x));
      }
    }

    // MODIFY args need to be copied before they are set
    if ((flags & vips.VipsArgumentFlags.MODIFY) !== 0) {
      value = value.copy().copy_memory();
    }

    vips.VipsObject.prototype.set.call(this, field, value);
  };

  Operation.prototype.getFlags = function () {
    return libvips.vips_operation_get_flags(this.buffer);
  };

  // horribly slow! call sparingly
  // FIXME ... we could cache and reuse these from the operator nickname
  Operation.prototype.getArgs = function () {
    var args = [];

    var argumentMapCallback = ffi.Callback('pointer',
      [StructOperationP,
        vips.StructGParamSpecP,
        vips.StructVipsArgumentClassP,
        vips.StructVipsArgumentInstanceP, 'pointer', 'pointer'],
            function (vo, pspec, argumentClass) {
              var name = pspec.deref().name;
              var flags = argumentClass.deref().flags;

              if ((flags & vips.VipsArgumentFlags.CONSTRUCT) !== 0) {
                // libvips uses '-' to separate parts of arg names, but we
                // need '_' for JS
                name = name.replace(/-/g, '_');

                args.push([name, flags]);
              }

              return ref.NULL;
            }
        );

    libvips.vips_argument_map(this.buffer,
            argumentMapCallback, ref.NULL, ref.NULL);

    return args;
  };

  function findInside (x, fn) {
    if (fn(x)) {
      return x;
    } else if (x instanceof Array) {
      for (let i of x) {
        var y = findInside(i, fn);

        if (y !== null) { return y; }
      }
    }

    return null;
  }

  // cache the args for each operation here ... saves lots of calls to
  // getArgs().
  vips.operationArgsCache = {};

  function analyzeArgs (nickname) {
    if (nickname in vips.operationArgsCache) {
      return vips.operationArgsCache[nickname];
    }

    var op = Operation.newFromName(nickname);
    var result = {};

    result.args = op.getArgs();

    // a thing to quickly get flags from name
    result.flagsFromName = {};
    for (let x of result.args) {
      let name = x[0];
      let flags = x[1];

      result.flagsFromName[name] = flags;
    }

    // find required input and output args
    result.requiredInput = [];
    result.requiredOutput = [];
    for (let x of result.args) {
      let name = x[0];
      let flags = x[1];

      if ((flags & vips.VipsArgumentFlags.INPUT) !== 0 &&
                (flags & vips.VipsArgumentFlags.REQUIRED) !== 0 &&
                (flags & vips.VipsArgumentFlags.DEPRECATED) === 0) {
        result.requiredInput.push(name);
      }

      if ((flags & vips.VipsArgumentFlags.OUTPUT) !== 0 &&
                (flags & vips.VipsArgumentFlags.REQUIRED) !== 0 &&
                (flags & vips.VipsArgumentFlags.DEPRECATED) === 0) {
        result.requiredOutput.push(name);
      }

      // MODIFY input args are also required output
      if ((flags & vips.VipsArgumentFlags.INPUT) !== 0 &&
                (flags & vips.VipsArgumentFlags.MODIFY) !== 0) {
        result.requiredOutput.push(name);
      }
    }

    vips.operationArgsCache[nickname] = result;

    return result;
  }

  function callArgs () {
    var args = Array.from(arguments);
    if (args.length < 1 ||
      (typeof args[0] !== 'string' &&
       !(args[0] instanceof String))) {
      throw new Error('first arg to call must be an operation name');
    }

    var nickname = args[0];
    var suppliedArgs = args.slice(1, args.length);
    // changed later, see below
    var suppliedOptionalArgs = {};

    // console.log("nickname = " + nickname);
    // console.log("suppliedArgs = " + suppliedArgs);
    // console.log("suppliedOptionalArgs = " +
    // JSON.stringify(suppliedOptionalArgs, null, "  "));

    var op = Operation.newFromName(nickname);
    var operationArgs = analyzeArgs(nickname);

    // the final supplied argument can be a hash of options, or undefined
    var nRequired = operationArgs.requiredInput.length;
    if (suppliedArgs.length !== nRequired &&
      suppliedArgs.length !== nRequired + 1) {
      throw new Error('operation ' + nickname + ' needs ' + nRequired +
        ' arguments, you supplied ' + suppliedArgs.length);
    }
    if (suppliedArgs.length === nRequired + 1) {
      let options = suppliedArgs.pop();

      if (options !== undefined) {
        suppliedOptionalArgs = options;
      }
    }

    // pull out the special 'stringOptions' option
    var stringOptions = '';
    if ('stringOptions' in suppliedOptionalArgs) {
      let options = suppliedOptionalArgs['stringOptions'];
      delete suppliedOptionalArgs['stringOptions'];
      if (options !== undefined) {
        stringOptions = options;
      }
    }

    // look for the special 'async' option and tag us as being in async mode if
    // it's there
    var inAsyncMode = 'async' in suppliedOptionalArgs;
    var asyncCallback;
    if (inAsyncMode) {
      asyncCallback = suppliedOptionalArgs['async'];
      delete suppliedOptionalArgs['async'];
    } else {
      // just set it to a null handler
      // FIXME ... there must be a null (or return?) handler defined in async,
      // but I can't find it
      asyncCallback = function (err, result) {
        if (err) {
          throw err;
        } else {
          return result;
        }
      };
    }

    // the first image argument is the thing we expand constants to
    // match ... look inside tables for images, since we may be passing
    // an array of image as a single param
    var matchImage = findInside(suppliedArgs, (x) => x instanceof vips.Image);

    // set any string options before any args so they can't be
    // overridden
    op.setFromString(stringOptions);

    // set required and optional args
    for (let i in operationArgs.requiredInput) {
      let name = operationArgs.requiredInput[i];
      let flags = operationArgs.flagsFromName[name];

      // console.log("set " + name + " = " + suppliedArgs[n]);
      op.set(name, flags, matchImage, suppliedArgs[i]);
    }

    for (let name of Object.keys(suppliedOptionalArgs)) {
      let flags = operationArgs.flagsFromName[name];
      let value = suppliedOptionalArgs[name];

      // console.log("set " + name + " = " + value);
      op.set(name, flags, matchImage, value);
    }

    // handle the return from _build
    //
    // this has to be a separate function so we can run it as an async callback
    // if we are in async mode
    //
    // this has to be a nested function so it can pick up context from callArgs
    function handleBuildReturn (err, vop) {
      console.log('handleBuildReturn ' + nickname + ' ...');

      // err can't be anything except null after _build, but handle it anyway
      if (err) {
        return asyncCallback(err, null);
      }

      // if _build failed, we see NULL
      if (vop.isNull()) {
        return asyncCallback(new vips.VipsError('unable to call ' + nickname),
          null);
      }
      op = new Operation(vop);

      var result = [];

      // fetch required output args, plus modified input images
      for (let name of operationArgs.requiredOutput) {
        let value = op.get(name);
        // console.log("get " + name + " = " + value);
        result.push(value);
      }

      // fetch optional output args
      var opts = {};
      for (let name of Object.keys(suppliedOptionalArgs)) {
        let flags = operationArgs.flagsFromName[name];

        if ((flags & vips.VipsArgumentFlags.OUTPUT) !== 0 &&
          (flags & vips.VipsArgumentFlags.REQUIRED) === 0 &&
          (flags & vips.VipsArgumentFlags.DEPRECATED) === 0) {
          let value = op.get(name);
          // console.log("get " + name + " = " + value);
          opts[name] = value;
        }
      }

      libvips.vips_object_unref_outputs(op.buffer);

      if (Object.keys(opts).length > 0) {
        result.push(opts);
      }

      if (result.length === 0) {
        result = null;
      } else if (result.length === 1) {
        result = result[0];
      }

      // console.log("result = " + JSON.stringify(result, null, "  "));

      return asyncCallback(null, result);
    }

    // build operation
    if (inAsyncMode) {
      libvips.vips_cache_operation_build.async(op.buffer, handleBuildReturn);
    } else {
      var vop = libvips.vips_cache_operation_build(op.buffer);

      return handleBuildReturn(null, vop);
    }
  }

  // turn camel_case into camelCase
  function camelize (name) {
    return name.replace(/_(.)/g, (m, p1) => p1.toUpperCase());
  }

  // Generate a single wrapper for a gtype.
  function generateWrapper (nickname) {
    var op = Operation.newFromName(nickname);
    if (op.getFlags() & VipsOperationFlags.DEPRECATED) {
      return;
    }

    var operationArgs = op.getArgs();

    // only interested in non-deprecated args
    var args = [];
    for (let x of operationArgs) {
      let flags = x[1];

      if ((flags & vips.VipsArgumentFlags.DEPRECATED) === 0) {
        args.push(x);
      }
    }
    operationArgs = args;

    // find the first required input image arg, if any ... that will be
    // this
    var thisArgument;
    for (let x of operationArgs) {
      let name = x[0];
      let flags = x[1];

      if ((flags & vips.VipsArgumentFlags.INPUT) !== 0 &&
        (flags & vips.VipsArgumentFlags.REQUIRED) !== 0 &&
        op.getTypeOf(name) === vips.GTYPES.VipsImage) {
        thisArgument = name;
        break;
      }
    }

    // all other required inputs
    var requiredInput = [];
    for (let x of operationArgs) {
      let name = x[0];
      let flags = x[1];

      if ((flags & vips.VipsArgumentFlags.INPUT) !== 0 &&
        (flags & vips.VipsArgumentFlags.REQUIRED) !== 0 &&
        name !== thisArgument) {
        // rename to avoid clashes with "in" keyword
        if (name === 'in') {
          name = 'input';
        }

        requiredInput.push(camelize(name));
      }
    }

    // there's always an options at the end
    requiredInput.push('options');

    // libvips uses snake_case for operation names: do a crude conversion to
    // camelCase to make it look more javascripty and to stop semistandard from
    // complaining
    var jsName = camelize(nickname);

    var result;

    result = '';

    result += '  vips.Image.';
    if (thisArgument) {
      result += 'prototype.';
    }
    result += jsName + ' = function (';
    result += requiredInput.join(', ');
    result += ') {\n';
    result += '    return vips.call(\'' + nickname + '\', ';
    if (thisArgument) {
      requiredInput.unshift('this');
    }
    result += requiredInput.join(', ');
    result += ');\n';
    result += '  };';

    return result;
  }

  /* Aim to generate wrappers like this:
   *
   * Image.prototype.embed = function (left, top, width, height, options) {
   *   return vips.call('embed', this, left, top, width, height, options);
   * }
   *
   * Class members (ie. no image arg) are missing "prototype" and "this".
   *
   * We could generate docs too, see generate_sphinx() in
   * pyvips/pyvips/voperation.py.
   */
  function generateWrappers () {
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

    var wrapperOf = {};

    function addDocs (gtype) {
      var nickname = vips.nicknameFind(gtype);
      if (banned.indexOf(nickname) === -1) {
        try {
          wrapperOf[nickname] = generateWrapper(nickname);
        } catch (err) {
        }

        vips.typeMap(gtype, addDocs);
      }

      return ref.NULL;
    }

    vips.typeMap(vips.typeFromName('VipsOperation'), addDocs);

    console.log('\'use strict\';');
    console.log('');
    console.log('// this file is generated automatically -- do not edit!');
    console.log('');
    console.log('module.exports = function (vips) {');
    var nicknames = Object.keys(wrapperOf).sort();
    var bodies = nicknames.map((nickname) => wrapperOf[nickname]);
    console.log(bodies.join('\n\n'));
    console.log('};');
  }

  function call (/* name, many other args */) {
    return callArgs.apply(null, arguments);
  }

  function cacheSetMax (max) {
    libvips.vips_cache_set_max(max);
  }

  function cacheSetMaxMem (max) {
    libvips.vips_cache_set_max_mem(max);
  }

  function cacheSetMaxFiles (max) {
    libvips.vips_cache_set_max_files(max);
  }

  function cacheSetTrace (trace) {
    libvips.vips_cache_set_trace(trace);
  }

  vips.cacheSetMax = cacheSetMax;
  vips.cacheSetMaxMem = cacheSetMaxMem;
  vips.cacheSetMaxFiles = cacheSetMaxFiles;
  vips.cacheSetTrace = cacheSetTrace;

  vips.vipsOperationNew = vipsOperationNew;
  vips.Operation = Operation;
  vips.call = call;

  vips.generateWrapper = generateWrapper;
  vips.generateWrappers = generateWrappers;
};
