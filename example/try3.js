'use strict';

var ref = require('ref');
var ffi = require('ffi');
var StructType = require('ref-struct');

var GType = ref.types.uint64;

var StructGValue = StructType({
    'gtype': GType,
    'data0': ref.types.uint64,
    // ugly, but how would you declare uint64[2] with ArrayType?
    'data1': ref.types.uint64
});
var PStructGValue = ref.refType(StructGValue);

var libgobject = ffi.Library('libgobject-2.0', {
    'g_value_init': ['void', [PStructGValue, GType]],
    'g_value_unset': ['void', [PStructGValue]],

    'g_value_set_boolean': ['void', [PStructGValue, 'bool']],
    'g_value_get_boolean': ['bool', [PStructGValue]]
});

var gv = new StructGValue();
gv.gtype = 0;
libgobject.g_value_init(gv.ref(), 20);
libgobject.g_value_set_boolean(gv.ref(), true);
var result = libgobject.g_value_get_boolean(gv.ref());
console.log('result = ' + result);
