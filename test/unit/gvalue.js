'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const ref = require('ref');

const vips = require('../../');

describe('GValue', function () {
    it('Can make a GValue', function () {
        var gv = new vips.GValue();
    });

    it('Can set/get a bool', function () {
        var gv = new vips.GValue();
        gv.init(vips.GTYPES.gboolean);
        gv.set(true);
        assert.strictEqual(gv.get(), true);
    });

    it('Can set/get a int', function () {
        var gv = new vips.GValue();
        gv.init(vips.GTYPES.gint);
        gv.set(12);
        assert.strictEqual(gv.get(), 12);
    });

    it('Can set/get a double', function () {
        var gv = new vips.GValue();
        gv.init(vips.GTYPES.gdouble);
        gv.set(3.1415);
        assert.strictEqual(gv.get(), 3.1415);
    });

    it('Can set/get a string', function () {
        var gv = new vips.GValue();
        gv.init(vips.GTYPES.gchararray);
        gv.set("hello world");
        assert.strictEqual(gv.get(), "hello world");
    });

    it('Can set/get a utf-8 string', function () {
        var gv = new vips.GValue();
        gv.init(vips.GTYPES.gchararray);
        gv.set("йцук");
        assert.strictEqual(gv.get(), "йцук");
    });

    it('Can set/get an array of int', function () {
        var gv = new vips.GValue();
        gv.init(vips.GTYPES.VipsArrayInt);
        gv.set([1, 2, 3]);
        assert.deepEqual(gv.get(), [1, 2, 3]);
    });

    it('Can set/get an array of double', function () {
        var gv = new vips.GValue();
        gv.init(vips.GTYPES.VipsArrayDouble);
        gv.set([1.1, 2.1, 3.1]);
        assert.deepEqual(gv.get(), [1.1, 2.1, 3.1]);
    });

    it('Can set/get a blob with ascii', function () {
        var value = 'abc';

        var gv = new vips.GValue();
        gv.init(vips.GTYPES.VipsBlob);
        gv.set(value);
        var result = gv.get();

        for (var i = 0; i < result.length; i++) {
            assert.strictEqual(result[i], value.charCodeAt(i));
        }
    });

    it('Can set/get a blob with binary data', function () {
        var value = new Uint8Array(256);
        for (var i = 0; i < value.length; i++) {
            value[i] = i;
        }

        var gv = new vips.GValue();
        gv.init(vips.GTYPES.VipsBlob);
        gv.set(value.buffer);
        var result = gv.get();

        for (var i = 0; i < result.length; i++) {
            assert.strictEqual(result[i], value[i]);
        }
    });

    it('Can set/get an enum by number', function () {
        var gv = new vips.GValue();
        gv.init(vips.GTYPES.VipsInterpretation);
        gv.set(22);

    });

    it('Can set/get an enum by name', function () {
        var gv = new vips.GValue();
        gv.init(vips.GTYPES.VipsInterpretation);
        gv.set('srgb');
        assert.strictEqual(gv.get(), 'srgb');
    });

    it('Throws an exception for bad enum value', function () {
        var gv = new vips.GValue();
        gv.init(vips.GTYPES.VipsInterpretation);
        assert.throws(function () {
            gv.set('banana');
        });
    });

    it('Can set/get flags', function () {
        var gv = new vips.GValue();
        gv.init(vips.GTYPES.VipsOperationFlags);
        gv.set(12);
        assert.strictEqual(gv.get(), 12);
    });

});
