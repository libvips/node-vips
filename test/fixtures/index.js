'use strict';

const path = require('path');
const vips = require('../../');

const get_path = function (filename) {
    return path.join(__dirname, filename);
};

module.exports = {
    input_jpeg_file: get_path('small_quagga.jpg'),
    missing_file: get_path('banana'),
    bad_file_extension: get_path('banana.what'),

    output_jpeg_file: get_path('output.jpg'),
    output_vips_file: get_path('output.v')
};
