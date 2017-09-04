'use strict';

console.log('hello from try1.js');

var ffi = require('ffi');

var libm = ffi.Library('libm', {
  'ceil': [ 'double', [ 'double' ] ]
});

var x = 1.2;
var y = libm.ceil(1.5);
console.log('libm.ceil(' + x + ') = ' + y);

// You can also access just functions in the current process by passing a null
var current = ffi.Library(null, {
  'atoi': [ 'int', [ 'string' ] ]
});

var a = '1234';
var b = current.atoi('1234');
console.log('current.atoi("' + a + '") = ' + b);
