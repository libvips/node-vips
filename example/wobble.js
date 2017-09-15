#!/usr/bin/env node

'use strict';

/*
 * A wobble effect. Run with eg.:
 *
 *  ./wobble.js ../test/fixtures/small_quagga.jpg x.jpg
 *
 * and have a look at x.jpg.
 */

var vips = require('..');

function wobble (image) {
  // this makes an image where pixel (0, 0) (at the top-left) has value [0, 0],
  // and pixel (image.width, image.height) at the bottom-right has value
  // [image.width, image.height]
  var index = vips.Image.xyz(image.width, image.height);

  // make a version with (0, 0) at the centre, negative values up and left,
  // positive down and right
  var centre = index.subtract([image.width / 2, image.height / 2]);

  // to polar space, so each pixel is now distance and angle in degrees
  var polar = centre.polar();
  var polarBands = polar.bandsplit();

  // scale sin(distance) by 1/distance to make a wavey pattern
  var num = polarBands[0].multiply(3).sin();
  var denom = polarBands[0].add(1);
  var d = num.divide(denom).multiply(10000);

  // and back to rectangular coordinates again to make a set of vectors we can
  // add to the original index image
  index = index.add(d.bandjoin(polarBands[1]).rect());

  // finally, use our modified index image to distort the input!
  return image.mapim(index);
}

var image = vips.Image.newFromFile(process.argv[2]);
image = wobble(image);
image.writeToFile(process.argv[3]);
