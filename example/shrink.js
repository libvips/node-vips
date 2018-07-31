#!/usr/bin/env node

'use strict';

var vips = require('..');

var image = vips.Image.thumbnail(process.argv[2], 187);
image.writeToFile(process.argv[3]);
