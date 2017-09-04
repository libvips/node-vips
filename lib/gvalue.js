'use strict';

console.log('hello from gvalue.js');

var ref = require('ref');
var StructType = require('ref-struct')
var ArrayType = require('ref-array')
var finalize = require('finalize');
var ffi = require('ffi');

// we can't just use ulong, windows has different int sizing rules
if (ref.types.CString.size == 8) {
    var GType = ref.types.uint64;
}
else {
    var GType = ref.types.uint32;
}

var StructGValue = StructType({
      'gtype': GType,
      'data0': ref.types.uint64, 
      // ugly, but how would you declare uint64[2] with ArrayType?
      'data1': ref.types.uint64
})
var PStructGValue = ref.refType(StructGValue);

var libgobject = ffi.Library('libgobject-2.0', {
    'g_type_name': ['string', [GType]],
    'g_type_from_name': [GType, ['string']],
    'g_type_fundamental': [GType, [GType]],

    'g_value_init': ['void', [PStructGValue, GType]],
    'g_value_unset': ['void', [PStructGValue]],

    'g_value_set_boolean': ['void', [PStructGValue, 'bool']],

    'g_value_get_boolean': ['bool', [PStructGValue]]
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

var libvips = ffi.Library('libvips', {
    'vips_enum_nick': ['string', [GType, 'int']],
    'vips_enum_from_nick': ['int', ['string', GType, 'string']]

});

var GTYPE = {
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
    console.log('GValue#new: ' + this.buffer.ref());

    finalize(this, function (gv) {
        console.log('GValue#finalize: starting');
        libgobject.g_value_unset(this.buffer.ref());
        console.log('GValue#finalize: done ' + this.buffer.ref());
    });
};

GValue.prototype.constructor = GValue;

GValue.prototype.init = function (gtype) {
    libgobject.g_value_init(this.buffer.ref(), gtype);
};

GValue.prototype.set = function (value) {
    var gtype = this.buffer.gtype;
    var fundamental = libgobject.g_type_fundamental(gtype);


    switch (gtype) {
    case GTYPE.gbool:
        libgobject.g_value_set_boolean(this.buffer.ref(), value);
        break;

    default:
        throw new Error('unimplemented gtype in set()');
    }
};

GValue.prototype.get = function () {
    var gtype = this.buffer.gtype;
    var fundamental = libgobject.g_type_fundamental(gtype);

    var result;

    switch (gtype) {
    case GTYPE.gbool:
        result = libgobject.g_value_get_boolean(this.buffer.ref());
        break;

    default:
        throw new Error('unimplemented gtype in get()');
    }

    return result;
};

module.exports = {
    'GType': GType,
    'GValue': GValue,
    'GTYPE': GTYPE,
    'type_name': type_name,
    'type_from_name': type_from_name,
    'type_fundamental': type_fundamental,

};
