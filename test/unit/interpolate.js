'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const fixtures = require('../fixtures');

const vips = require('../../');

describe('Interpolate', function () {
    beforeEach(function () {
        if ('gc' in global) {
            console.log("gc-ing");
            global.gc();
        }
    });

    it('Can make an interpolator', function () {
        var interp = vips.Interpolate.new_from_name('bicubic');
    });

    it('Can set an interpolator for affine', function () {
        var image = vips.Image.new_from_file(fixtures.output_vips_file);
        var interp2 = vips.Interpolate.new_from_name('bilinear');
        var interp3 = vips.Interpolate.new_from_name('bicubic');
        var image2 = image.affine([2, 0, 0, 2], {interpolate: interp2});
        var image3 = image.affine([2, 0, 0, 2], {interpolate: interp3});

        assert.strictEqual(image2.width, image3.width);
        assert.strictEqual(image2.height, image3.height);
        assert.strictEqual(image2.bands, image3.bands);
    });

});
