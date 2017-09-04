'use strict';

console.log('hello from index.js');

var ffi = require('ffi');

var libvips = ffi.Library('libvips', {
  'vips_init': [ 'int', [ 'string' ] ],
  'vips_version': [ 'int', [ 'int' ] ]
});

var ret = libvips.vips_init('banana');
if (ret != 0) {
    throw new Error('unable to init libvips');
}

const Vips = {
    'major': libvips.vips_version(0),
    'minor': libvips.vips_version(1),
    'is_min_libvips': function (required_major, required_minor) {
        return Vips.major > required_major || 
            (Vips.major == required_major && Vips.minor >= required_minor);
    },
    'gvalue': require('./gvalue')
};

if (!Vips.is_min_libvips(8, 2)) {
    throw new Error('need libvips 8.2 or newer, but found ' + 
        Vips.major + '.' + Vips.minor);
}

module.exports = Vips;
