'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const vips = require('../../');

describe('VipsObject', function () {
    beforeEach(function () {
        if ('gc' in global) {
            console.log("gc-ing");
            global.gc();
        }
    });

    it('Can make a VipsObject', function () {
        var vo = vips.vips_operation_new('black');
        var vips_object = new vips.VipsObject(vo);
    });

    it('Throws an exception for get of unknown property', function () {
        var vo = vips.vips_operation_new('black');
        var vips_object = new vips.VipsObject(vo);
        assert.throws(function () {
            vips_object.get('banana')
        });
    });

    it('Can get a property', function () {
        var vo = vips.vips_operation_new('black');
        var vips_object = new vips.VipsObject(vo);
        var name = vips_object.get('nickname');
        // nickname is '' until build
        assert.strictEqual(name, '');
    });

    it('Can set a property', function () {
        var vo = vips.vips_operation_new('black');
        var vips_object = new vips.VipsObject(vo);
        vips_object.set('nickname', 'banana');
        var name = vips_object.get('nickname');
        assert.strictEqual(name, 'banana');
    });

    it('Can get a property blurb', function () {
        var vo = vips.vips_operation_new('black');
        var vips_object = new vips.VipsObject(vo);
        var blurb = vips_object.get_blurb('nickname');
        assert.strictEqual(blurb, 'Class nickname');
    });

    it('Can get object description', function () {
        var vo = vips.vips_operation_new('black');
        var vips_object = new vips.VipsObject(vo);
        var desc = vips_object.get_description();
        assert.strictEqual(desc, 'make a black image');
    });

    it('Can set from string', function () {
        var vo = vips.vips_operation_new('black');
        var vips_object = new vips.VipsObject(vo);
        var result = vips_object.set_from_string('nickname = banana');
        var name = vips_object.get('nickname');
        assert.strictEqual(name, 'banana');
    });

});
