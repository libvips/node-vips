'use strict';

var ref = require('ref');
var FFI = require('ffi');
var Struct = require('ref-struct');

var TimeVal = Struct({
  'tv_sec': 'long',
  'tv_usec': 'long'
});
var TimeValPtr = ref.refType(TimeVal);

var lib = new FFI.Library(null, { 
    'gettimeofday': ['int', [TimeValPtr, "pointer"]]
});

var tv = new TimeVal();
lib.gettimeofday(tv.ref(), null);
console.log("Seconds since epoch: " + tv.tv_sec);
