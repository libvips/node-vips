'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const vips = require('../../');
const fixtures = require('../fixtures');

function almostEqual(a, b, precision) {
    precision = typeof precision !== 'undefined' ? precision : 0.000001;

    return Math.abs(a - b) < precision;
}

describe('Image', function () {
    it('Can make an Image', function () {
        var op = new vips.Image(12);
    });

    it('Can make an image with "black"', function () {
        var image = vips.call('black', 20, 10);
        assert.strictEqual(image.get("width"), 20);
        assert.strictEqual(image.get("height"), 10);
        assert.strictEqual(image.get("bands"), 1);
        assert.strictEqual(vips.call('avg', image), 0);
    });

    it('Image properties work', function () {
        var image = vips.call('black', 20, 10);
        assert.strictEqual(image.width, 20);
        assert.strictEqual(image.height, 10);
        assert.strictEqual(image.bands, 1);
        assert.strictEqual(image.format, 'uchar');
        assert.strictEqual(image.interpretation, 'b-w');
        assert.strictEqual(image.xres, 1);
        assert.strictEqual(image.yres, 1);
        assert.strictEqual(image.xoffset, 0);
        assert.strictEqual(image.yoffset, 0);
        assert.strictEqual(image.filename, 'temp-0');
        assert.strictEqual(image.scale, 1);
        assert.strictEqual(image.offset, 0);
    });

    it('Can get type of image metadata items', function () {
        var image = vips.Image.new_from_file(fixtures.input_jpeg_file);
        assert.strictEqual(image.get_typeof('icc-profile-data'), 
            vips.GTYPES.VipsBlob);
    });

    it('Can get image metadata items', function () {
        var image = vips.Image.new_from_file(fixtures.input_jpeg_file);
        var profile = image.get('icc-profile-data');
        assert.strictEqual(profile.length, 560); 
        assert.strictEqual(profile[profile.length - 1], 156); 
    });

    it('Can enumerate image metadata', function () {
        var image = vips.Image.new_from_file(fixtures.input_jpeg_file);
        var fields = image.get_fields();
        assert.strictEqual(fields.length, 63); 
    });

    it('Can create image metadata', function () {
        var image = vips.call('black', 20, 10);
        image.set_typeof(vips.GTYPES.gint, 'banana', 42);
        assert.strictEqual(image.get('banana'), 42);
    });

    it('Can update image metadata', function () {
        var image = vips.call('black', 20, 10);
        image.set_typeof(vips.GTYPES.gint, 'banana', 42);
        image.set('banana', 45);
        assert.strictEqual(image.get('banana'), 45);
    });

    it('Can remove image metadata', function () {
        var image = vips.call('black', 20, 10);
        image.set_typeof(vips.GTYPES.gint, 'banana', 42);
        image.remove('banana');
        assert.throws(function () {
            image.get('banana');
        });
    });

});
