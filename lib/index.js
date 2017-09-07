'use strict';

var ffi = require('ffi');

var libvips = ffi.Library('libvips', {
    vips_init: ['int', ['string']],
    vips_version: ['int', ['int']]
});

var ret = libvips.vips_init('banana');
if (ret != 0) {
    throw new Error('unable to init libvips');
}

var vips = { 
    major: libvips.vips_version(0),
    minor: libvips.vips_version(1)

};

vips.is_min_libvips = function (required_major, required_minor) {
    return vips.major > required_major || 
        (vips.major == required_major && vips.minor >= required_minor);
};

if (!vips.is_min_libvips(8, 2)) {
    throw new Error('need libvips 8.2 or newer, but found ' + 
        vips.major + '.' + vips.minor);
}

[
    'gvalue',
    'gobject',
    'vipsobject',
    'vipsoperation'
].forEach(function (name) {
    require('./' + name)(vips);
})

module.exports = vips;
