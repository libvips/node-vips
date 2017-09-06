'use strict';

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const vips = require('../../');

describe('GObject', function () {
    it('Can make a GObject', function () {
        var go = vips.vips_operation_new('black');
        var gobject = new vips.GObject(go);
    });

});
