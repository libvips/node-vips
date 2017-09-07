'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const vips = require('../../');

describe('VipsObject', function () {
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

});
