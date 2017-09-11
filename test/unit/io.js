'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const fixtures = require('../fixtures');

const vips = require('../../');

function almostEqual(a, b, precision) {
    precision = typeof precision !== 'undefined' ? precision : 0.000001;

    return Math.abs(a - b) < precision;
}

describe('Image IO', function () {
    beforeEach(function () {
        if ('gc' in global) {
            console.log("gc-ing");
            global.gc();
        }
    });

    it('Can write a vips image', function () {
        var image = vips.call('black', 20, 10);
        image.write_to_file(fixtures.output_vips_file);
    });

    it('Can read back a vips image from a file', function () {
        var image = vips.call('black', 20, 10);
        image.write_to_file(fixtures.output_vips_file);
        var image2 = vips.Image.new_from_file(fixtures.output_vips_file);
        assert.strictEqual(image2.get("width"), 20);
        assert.strictEqual(image2.get("height"), 10);
        assert.strictEqual(image2.get("bands"), 1);
        assert.strictEqual(vips.call('avg', image2), 0);
    });

    it('Can open a jpg image from a file', function () {
        var image = vips.Image.new_from_file(fixtures.input_jpeg_file);
        assert.strictEqual(image.get("width"), 1000);
        assert.strictEqual(image.get("height"), 667);
        assert.strictEqual(image.get("bands"), 3);
        assert.ok(almostEqual(vips.call('avg', image), 99.096, 0.01));
    });

    it('Can pass options to new_from_file', function () {
        var image = vips.Image.new_from_file(fixtures.input_jpeg_file, 
            {shrink: 2});
        assert.strictEqual(image.get("width"), 500);
        assert.strictEqual(image.get("height"), 334);
        assert.strictEqual(image.get("bands"), 3);
    });

    it('Throws an error for file does not exist', function () {
        assert.throws(function () {
            var image = vips.Image.new_from_file(fixtures.missing_file); 
        });
    });

    it('Throws an error for bad save extension', function () {
        var image = vips.call('black', 20, 10);
        assert.throws(function () {
            image.write_to_file(fixtures.bad_file_extension); 
        });
    });

    it('Can save a formatted image to memory', function () {
        var image = vips.Image.new_from_file(fixtures.input_jpeg_file);
        var buf1 = image.write_to_buffer('.jpg');
        var buf2 = image.write_to_buffer('.jpg', {Q: 90});
        assert.ok(buf1.length > 1000);
        assert.ok(buf1.length < buf2.length);
    });

    it('Can load a formatted image from memory', function () {
        var image = vips.Image.new_from_file(fixtures.input_jpeg_file);
        var buf = image.write_to_buffer('.jpg');
        var image2 = vips.Image.new_from_buffer(buf);
        assert.ok(almostEqual(image.avg(), image2.avg(), 0.01));
    });

    it('Can save a raw image to memory', function () {
        var image = vips.Image.new_from_file(fixtures.input_jpeg_file);
        var buf = image.write_to_memory();
        assert.strictEqual(buf.length, image.width * image.height * image.bands);
    });

    it('Can load a raw image from memory', function () {
        var image = vips.Image.new_from_file(fixtures.input_jpeg_file);
        var buf = image.write_to_memory();
        var image2 = vips.Image.new_from_memory(buf, 
            image.width, image.height, image.bands, image.format); 
        assert.ok(almostEqual(image.avg(), image2.avg(), 0.01));
    });


});
