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

describe('Image arithmetic', function () {
    beforeEach(function () {
        if ('gc' in global) {
            console.log("gc-ing");
            global.gc();
        }
    });

    it('.add works with scalar, vector and image arguments', function () {
        var image = vips.Image.black(2, 1);
        var image2 = image.add(1);
        assert.strictEqual(image2.width, 2);
        assert.strictEqual(image2.height, 1);
        assert.strictEqual(image2.format, 'float');
        assert.strictEqual(image2.interpretation, 'b-w');
        assert.deepEqual(image2.getpoint(0, 0), [1]);

        var image2 = image.add([1, 2]);
        assert.strictEqual(image2.width, 2);
        assert.strictEqual(image2.height, 1);
        assert.strictEqual(image2.format, 'float');
        assert.strictEqual(image2.interpretation, 'b-w');
        assert.deepEqual(image2.getpoint(0, 0), [1, 2]);

        var image2 = image2.add(image2);
        assert.strictEqual(image2.width, 2);
        assert.strictEqual(image2.height, 1);
        assert.strictEqual(image2.format, 'float');
        assert.strictEqual(image2.interpretation, 'b-w');
        assert.deepEqual(image2.getpoint(0, 0), [2, 4]);

    });

    it('.subtract works with scalar, vector and image arguments', function () {
        var image = vips.Image.black(2, 1);
        var image2 = image.add(10).subtract(1);
        assert.strictEqual(image2.width, 2);
        assert.strictEqual(image2.height, 1);
        assert.strictEqual(image2.format, 'float');
        assert.strictEqual(image2.interpretation, 'b-w');
        assert.deepEqual(image2.getpoint(0, 0), [9]);

        var image2 = image.add([10, 11]).subtract([9, 3]);
        assert.strictEqual(image2.width, 2);
        assert.strictEqual(image2.height, 1);
        assert.strictEqual(image2.format, 'float');
        assert.strictEqual(image2.interpretation, 'b-w');
        assert.deepEqual(image2.getpoint(0, 0), [1, 8]);

        var image2 = image.add(image2).add(image2).subtract(image2);
        assert.strictEqual(image2.width, 2);
        assert.strictEqual(image2.height, 1);
        assert.strictEqual(image2.format, 'float');
        assert.strictEqual(image2.interpretation, 'b-w');
        assert.deepEqual(image2.getpoint(0, 0), [1, 8]);

    });

    it('.rsubtract works with scalar, vector and image arguments', function () {
        var image = vips.Image.black(2, 1);
        var image2 = image.add(10).rsubtract(20);
        assert.strictEqual(image2.width, 2);
        assert.strictEqual(image2.height, 1);
        assert.strictEqual(image2.format, 'float');
        assert.strictEqual(image2.interpretation, 'b-w');
        assert.deepEqual(image2.getpoint(0, 0), [10]);

        var image2 = image.add([10, 11]).rsubtract([12, 16]);
        assert.strictEqual(image2.width, 2);
        assert.strictEqual(image2.height, 1);
        assert.strictEqual(image2.format, 'float');
        assert.strictEqual(image2.interpretation, 'b-w');
        assert.deepEqual(image2.getpoint(0, 0), [2, 5]);

        var image2 = image.add(image2).add(image2).rsubtract(image2);
        assert.strictEqual(image2.width, 2);
        assert.strictEqual(image2.height, 1);
        assert.strictEqual(image2.format, 'float');
        assert.strictEqual(image2.interpretation, 'b-w');
        assert.deepEqual(image2.getpoint(0, 0), [-2, -5]);

    });

    it('.multiply works with scalar, vector and image arguments', function () {
        var image = vips.Image.black(2, 1);
        var image2 = image.add(1).multiply(2);
        assert.strictEqual(image2.width, 2);
        assert.strictEqual(image2.height, 1);
        assert.strictEqual(image2.format, 'float');
        assert.strictEqual(image2.interpretation, 'b-w');
        assert.deepEqual(image2.getpoint(0, 0), [2]);

        var image2 = image.add([1, 2]).multiply([2, 3]);
        assert.strictEqual(image2.width, 2);
        assert.strictEqual(image2.height, 1);
        assert.strictEqual(image2.format, 'float');
        assert.strictEqual(image2.interpretation, 'b-w');
        assert.deepEqual(image2.getpoint(0, 0), [2, 6]);

        var image2 = image2.multiply(image2);
        assert.strictEqual(image2.width, 2);
        assert.strictEqual(image2.height, 1);
        assert.strictEqual(image2.format, 'float');
        assert.strictEqual(image2.interpretation, 'b-w');
        assert.deepEqual(image2.getpoint(0, 0), [4, 36]);

    });

    it('.divide works with scalar, vector and image arguments', function () {
        var image = vips.Image.black(2, 1);
        var image2 = image.add(10).divide(2);
        assert.strictEqual(image2.width, 2);
        assert.strictEqual(image2.height, 1);
        assert.strictEqual(image2.format, 'float');
        assert.strictEqual(image2.interpretation, 'b-w');
        assert.deepEqual(image2.getpoint(0, 0), [5]);

        var image2 = image.add([10, 30]).divide([2, 3]);
        assert.strictEqual(image2.width, 2);
        assert.strictEqual(image2.height, 1);
        assert.strictEqual(image2.format, 'float');
        assert.strictEqual(image2.interpretation, 'b-w');
        assert.deepEqual(image2.getpoint(0, 0), [5, 10]);

        var image2 = image2.add(image2).divide(image2);
        assert.strictEqual(image2.width, 2);
        assert.strictEqual(image2.height, 1);
        assert.strictEqual(image2.format, 'float');
        assert.strictEqual(image2.interpretation, 'b-w');
        assert.deepEqual(image2.getpoint(0, 0), [2, 2]);

    });

    it('.rdivide works with scalar, vector and image arguments', function () {
        var image = vips.Image.black(2, 1);
        var image2 = image.add(2).rdivide(10);
        assert.strictEqual(image2.width, 2);
        assert.strictEqual(image2.height, 1);
        assert.strictEqual(image2.format, 'float');
        assert.strictEqual(image2.interpretation, 'b-w');
        assert.deepEqual(image2.getpoint(0, 0), [5]);

        var image2 = image.add([2, 3]).rdivide([10, 30]);
        assert.strictEqual(image2.width, 2);
        assert.strictEqual(image2.height, 1);
        assert.strictEqual(image2.format, 'float');
        assert.strictEqual(image2.interpretation, 'b-w');
        assert.deepEqual(image2.getpoint(0, 0), [5, 10]);

        var image2 = image2.rdivide(image2.add(image2));
        assert.strictEqual(image2.width, 2);
        assert.strictEqual(image2.height, 1);
        assert.strictEqual(image2.format, 'float');
        assert.strictEqual(image2.interpretation, 'b-w');
        assert.deepEqual(image2.getpoint(0, 0), [2, 2]);

    });

});
