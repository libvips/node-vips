'use strict';

const path = require('path');

const getPath = function (filename) {
  return path.join(__dirname, filename);
};

module.exports = {
  input_jpeg_file: getPath('small_quagga.jpg'),
  missing_file: getPath('banana'),
  bad_file_extension: getPath('banana.what'),

  output_jpeg_file: getPath('output.jpg'),
  output_vips_file: getPath('output.v')
};
