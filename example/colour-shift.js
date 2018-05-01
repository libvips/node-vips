#!/usr/bin/env node

'use strict';

var vips = require('..');

var image = vips.Image.newFromFile(process.argv[2]);
image = image.colourspace('lch').add([0, 0, 120]).colourspace('srgb');
image.writeToFile(process.argv[3]);
