#!/usr/bin/env node

var vips = require('..');

var image = vips.Image.new_from_file(process.argv[2]);
image = image.crop(100, 100, image.width - 200, image.height - 200);

image = image.reduce(1.0 / 0.9, 1.0 / 0.9, {kernel: 'linear'});

var mask = vips.Image.new_from_array(
  [[-1, -1, -1],
     [-1, 16, -1],
     [-1, -1, -1]], 8);
image = image.conv(mask, {precision: 'integer'});

image.write_to_file(process.argv[3]);
