#!/usr/bin/env node

vips = require('..');

function wobble(image) {
    // this makes an image where pixel (0, 0) (at the top-left) has value [0, 0],
    // and pixel (image.width, image.height) at the bottom-right has value
    // [image.width, image.height]
    var index = vips.Image.xyz(image.width, image.height);

    // make a version with (0, 0) at the centre, negative values up and left,
    // positive down and right
    var centre = index.subtract([image.width / 2, image.height / 2]);

    // to polar space, so each pixel is now distance and angle in degrees
    var polar = centre.polar();

    // scale sin(distance) by 1/distance to make a wavey pattern
    var num = polar.real().multiply(3).sin();
    var denom = polar.imag().add(1)
    var d = num.divide(denom).multiply(10000);

    // and back to rectangular coordinates again to make a set of vectors we can
    // apply to the original index image
    var index = index.add(d.bandjoin(polar.imag()).rect());

    // finally, use our modified index image to distort the input!
    return image.mapim(index);
}

console.log(process.argv);
var image = vips.Image.new_from_file(process.argv[2]);
var image = wobble(image);
image.write_to_file(process.argv[3]);

