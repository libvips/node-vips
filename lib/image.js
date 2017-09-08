'use strict';

var ref = require('ref');
var StructType = require('ref-struct');
var ArrayType = require('ref-array');
var finalize = require('finalize');
var ffi = require('ffi');

module.exports = function (vips) {
    // inherit from GObject fields
    var LayoutImage = Object.assign(Object.assign({}, 
        vips.LayoutObject), {
        // opaque
    });
    var StructImage = StructType(LayoutImage);
    var StructImageP = ref.refType(StructImage);

    var libvips = ffi.Library('libvips', {
        vips_foreign_find_load: ['string', ['string']],
        vips_foreign_find_load_buffer: ['string', ['pointer', 'size_t']],
        vips_foreign_find_save: ['string', ['string']],
        vips_foreign_find_save_buffer: ['string', ['string']],

        /*

    VipsImage* vips_image_new_matrix_from_array (int width, int height,
                    const double* array, int size);
    VipsImage* vips_image_new_from_memory (const void* data, size_t size,
                    int width, int height, int bands, int format);

    VipsImage* vips_image_copy_memory (VipsImage* image);

    GType vips_image_get_typeof (const VipsImage* image,
                const char* name);
    int vips_image_get (const VipsImage* image,
                const char* name, GValue* value_copy);
    void vips_image_set (VipsImage* image, const char* name, GValue* value);
    int vips_image_remove (VipsImage* image, const char* name);
    char** vips_image_get_fields (VipsImage* image);

    char* vips_filename_get_filename (const char* vips_filename);
    char* vips_filename_get_options (const char* vips_filename);

    VipsImage* vips_image_new_temp_file (const char* format);

    int vips_image_write (VipsImage* image, VipsImage* out);
    void* vips_image_write_to_memory (VipsImage* in, size_t* size_out);

         */

    });

    var Image = function (ptr) {
        vips.VipsObject.call(this, ptr);
    }

    Image.prototype = Object.create(vips.VipsObject.prototype);
    Image.prototype.constructor = Image;

    vips.Image = Image;
};

