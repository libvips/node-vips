'use strict';

// this file is generated automatically -- do not edit!

module.exports = function (vips) {
  vips.Image.prototype.CMC2LCh = function (options) {
    return vips.call('CMC2LCh', this, options);
  };

  vips.Image.prototype.HSV2sRGB = function (options) {
    return vips.call('HSV2sRGB', this, options);
  };

  vips.Image.prototype.LCh2CMC = function (options) {
    return vips.call('LCh2CMC', this, options);
  };

  vips.Image.prototype.LCh2Lab = function (options) {
    return vips.call('LCh2Lab', this, options);
  };

  vips.Image.prototype.Lab2LCh = function (options) {
    return vips.call('Lab2LCh', this, options);
  };

  vips.Image.prototype.Lab2LabQ = function (options) {
    return vips.call('Lab2LabQ', this, options);
  };

  vips.Image.prototype.Lab2LabS = function (options) {
    return vips.call('Lab2LabS', this, options);
  };

  vips.Image.prototype.Lab2XYZ = function (options) {
    return vips.call('Lab2XYZ', this, options);
  };

  vips.Image.prototype.LabQ2Lab = function (options) {
    return vips.call('LabQ2Lab', this, options);
  };

  vips.Image.prototype.LabQ2LabS = function (options) {
    return vips.call('LabQ2LabS', this, options);
  };

  vips.Image.prototype.LabQ2sRGB = function (options) {
    return vips.call('LabQ2sRGB', this, options);
  };

  vips.Image.prototype.LabS2Lab = function (options) {
    return vips.call('LabS2Lab', this, options);
  };

  vips.Image.prototype.LabS2LabQ = function (options) {
    return vips.call('LabS2LabQ', this, options);
  };

  vips.Image.prototype.XYZ2Lab = function (options) {
    return vips.call('XYZ2Lab', this, options);
  };

  vips.Image.prototype.XYZ2Yxy = function (options) {
    return vips.call('XYZ2Yxy', this, options);
  };

  vips.Image.prototype.XYZ2scRGB = function (options) {
    return vips.call('XYZ2scRGB', this, options);
  };

  vips.Image.prototype.Yxy2XYZ = function (options) {
    return vips.call('Yxy2XYZ', this, options);
  };

  vips.Image.prototype.abs = function (options) {
    return vips.call('abs', this, options);
  };

  vips.Image.prototype.affine = function (matrix, options) {
    return vips.call('affine', this, matrix, options);
  };

  vips.Image.analyzeload = function (filename, options) {
    return vips.call('analyzeload', filename, options);
  };

  vips.Image.arrayjoin = function (input, options) {
    return vips.call('arrayjoin', input, options);
  };

  vips.Image.prototype.autorot = function (options) {
    return vips.call('autorot', this, options);
  };

  vips.Image.prototype.avg = function (options) {
    return vips.call('avg', this, options);
  };

  vips.Image.prototype.bandbool = function (boolean, options) {
    return vips.call('bandbool', this, boolean, options);
  };

  vips.Image.prototype.bandfold = function (options) {
    return vips.call('bandfold', this, options);
  };

  vips.Image.prototype.bandjoinConst = function (c, options) {
    return vips.call('bandjoin_const', this, c, options);
  };

  vips.Image.prototype.bandmean = function (options) {
    return vips.call('bandmean', this, options);
  };

  vips.Image.prototype.bandunfold = function (options) {
    return vips.call('bandunfold', this, options);
  };

  vips.Image.black = function (width, height, options) {
    return vips.call('black', width, height, options);
  };

  vips.Image.prototype.boolean = function (right, boolean, options) {
    return vips.call('boolean', this, right, boolean, options);
  };

  vips.Image.prototype.booleanConst = function (boolean, c, options) {
    return vips.call('boolean_const', this, boolean, c, options);
  };

  vips.Image.prototype.buildlut = function (options) {
    return vips.call('buildlut', this, options);
  };

  vips.Image.prototype.byteswap = function (options) {
    return vips.call('byteswap', this, options);
  };

  vips.Image.prototype.cache = function (options) {
    return vips.call('cache', this, options);
  };

  vips.Image.prototype.canny = function (options) {
    return vips.call('canny', this, options);
  };

  vips.Image.prototype.cast = function (format, options) {
    return vips.call('cast', this, format, options);
  };

  vips.Image.prototype.colourspace = function (space, options) {
    return vips.call('colourspace', this, space, options);
  };

  vips.Image.prototype.compass = function (mask, options) {
    return vips.call('compass', this, mask, options);
  };

  vips.Image.prototype.complex = function (cmplx, options) {
    return vips.call('complex', this, cmplx, options);
  };

  vips.Image.prototype.complex2 = function (right, cmplx, options) {
    return vips.call('complex2', this, right, cmplx, options);
  };

  vips.Image.prototype.complexform = function (right, options) {
    return vips.call('complexform', this, right, options);
  };

  vips.Image.prototype.complexget = function (get, options) {
    return vips.call('complexget', this, get, options);
  };

  vips.Image.composite = function (input, mode, options) {
    return vips.call('composite', input, mode, options);
  };

  vips.Image.prototype.composite2 = function (overlay, mode, options) {
    return vips.call('composite2', this, overlay, mode, options);
  };

  vips.Image.prototype.conv = function (mask, options) {
    return vips.call('conv', this, mask, options);
  };

  vips.Image.prototype.conva = function (mask, options) {
    return vips.call('conva', this, mask, options);
  };

  vips.Image.prototype.convasep = function (mask, options) {
    return vips.call('convasep', this, mask, options);
  };

  vips.Image.prototype.convf = function (mask, options) {
    return vips.call('convf', this, mask, options);
  };

  vips.Image.prototype.convi = function (mask, options) {
    return vips.call('convi', this, mask, options);
  };

  vips.Image.prototype.convsep = function (mask, options) {
    return vips.call('convsep', this, mask, options);
  };

  vips.Image.prototype.copy = function (options) {
    return vips.call('copy', this, options);
  };

  vips.Image.prototype.countlines = function (direction, options) {
    return vips.call('countlines', this, direction, options);
  };

  vips.Image.csvload = function (filename, options) {
    return vips.call('csvload', filename, options);
  };

  vips.Image.prototype.csvsave = function (filename, options) {
    return vips.call('csvsave', this, filename, options);
  };

  vips.Image.prototype.dE00 = function (right, options) {
    return vips.call('dE00', this, right, options);
  };

  vips.Image.prototype.dE76 = function (right, options) {
    return vips.call('dE76', this, right, options);
  };

  vips.Image.prototype.dECMC = function (right, options) {
    return vips.call('dECMC', this, right, options);
  };

  vips.Image.prototype.deviate = function (options) {
    return vips.call('deviate', this, options);
  };

  vips.Image.prototype.drawCircle = function (ink, cx, cy, radius, options) {
    return vips.call('draw_circle', this, ink, cx, cy, radius, options);
  };

  vips.Image.prototype.drawFlood = function (ink, x, y, options) {
    return vips.call('draw_flood', this, ink, x, y, options);
  };

  vips.Image.prototype.drawImage = function (sub, x, y, options) {
    return vips.call('draw_image', this, sub, x, y, options);
  };

  vips.Image.prototype.drawLine = function (ink, x1, y1, x2, y2, options) {
    return vips.call('draw_line', this, ink, x1, y1, x2, y2, options);
  };

  vips.Image.prototype.drawMask = function (ink, mask, x, y, options) {
    return vips.call('draw_mask', this, ink, mask, x, y, options);
  };

  vips.Image.prototype.drawRect = function (ink, left, top, width, height, options) {
    return vips.call('draw_rect', this, ink, left, top, width, height, options);
  };

  vips.Image.prototype.drawSmudge = function (left, top, width, height, options) {
    return vips.call('draw_smudge', this, left, top, width, height, options);
  };

  vips.Image.prototype.dzsave = function (filename, options) {
    return vips.call('dzsave', this, filename, options);
  };

  vips.Image.prototype.dzsaveBuffer = function (options) {
    return vips.call('dzsave_buffer', this, options);
  };

  vips.Image.prototype.embed = function (x, y, width, height, options) {
    return vips.call('embed', this, x, y, width, height, options);
  };

  vips.Image.prototype.extractArea = function (left, top, width, height, options) {
    return vips.call('extract_area', this, left, top, width, height, options);
  };

  vips.Image.prototype.extractBand = function (band, options) {
    return vips.call('extract_band', this, band, options);
  };

  vips.Image.eye = function (width, height, options) {
    return vips.call('eye', width, height, options);
  };

  vips.Image.prototype.falsecolour = function (options) {
    return vips.call('falsecolour', this, options);
  };

  vips.Image.prototype.fastcor = function (ref, options) {
    return vips.call('fastcor', this, ref, options);
  };

  vips.Image.prototype.fillNearest = function (options) {
    return vips.call('fill_nearest', this, options);
  };

  vips.Image.prototype.findTrim = function (options) {
    return vips.call('find_trim', this, options);
  };

  vips.Image.fitsload = function (filename, options) {
    return vips.call('fitsload', filename, options);
  };

  vips.Image.prototype.fitssave = function (filename, options) {
    return vips.call('fitssave', this, filename, options);
  };

  vips.Image.prototype.flatten = function (options) {
    return vips.call('flatten', this, options);
  };

  vips.Image.prototype.flip = function (direction, options) {
    return vips.call('flip', this, direction, options);
  };

  vips.Image.prototype.float2rad = function (options) {
    return vips.call('float2rad', this, options);
  };

  vips.Image.fractsurf = function (width, height, fractalDimension, options) {
    return vips.call('fractsurf', width, height, fractalDimension, options);
  };

  vips.Image.prototype.freqmult = function (mask, options) {
    return vips.call('freqmult', this, mask, options);
  };

  vips.Image.prototype.fwfft = function (options) {
    return vips.call('fwfft', this, options);
  };

  vips.Image.prototype.gamma = function (options) {
    return vips.call('gamma', this, options);
  };

  vips.Image.prototype.gaussblur = function (sigma, options) {
    return vips.call('gaussblur', this, sigma, options);
  };

  vips.Image.gaussmat = function (sigma, minAmpl, options) {
    return vips.call('gaussmat', sigma, minAmpl, options);
  };

  vips.Image.gaussnoise = function (width, height, options) {
    return vips.call('gaussnoise', width, height, options);
  };

  vips.Image.prototype.getpoint = function (x, y, options) {
    return vips.call('getpoint', this, x, y, options);
  };

  vips.Image.gifload = function (filename, options) {
    return vips.call('gifload', filename, options);
  };

  vips.Image.gifloadBuffer = function (buffer, options) {
    return vips.call('gifload_buffer', buffer, options);
  };

  vips.Image.prototype.globalbalance = function (options) {
    return vips.call('globalbalance', this, options);
  };

  vips.Image.prototype.gravity = function (direction, width, height, options) {
    return vips.call('gravity', this, direction, width, height, options);
  };

  vips.Image.grey = function (width, height, options) {
    return vips.call('grey', width, height, options);
  };

  vips.Image.prototype.grid = function (tileHeight, across, down, options) {
    return vips.call('grid', this, tileHeight, across, down, options);
  };

  vips.Image.prototype.histCum = function (options) {
    return vips.call('hist_cum', this, options);
  };

  vips.Image.prototype.histEntropy = function (options) {
    return vips.call('hist_entropy', this, options);
  };

  vips.Image.prototype.histEqual = function (options) {
    return vips.call('hist_equal', this, options);
  };

  vips.Image.prototype.histFind = function (options) {
    return vips.call('hist_find', this, options);
  };

  vips.Image.prototype.histFindIndexed = function (index, options) {
    return vips.call('hist_find_indexed', this, index, options);
  };

  vips.Image.prototype.histFindNdim = function (options) {
    return vips.call('hist_find_ndim', this, options);
  };

  vips.Image.prototype.histIsmonotonic = function (options) {
    return vips.call('hist_ismonotonic', this, options);
  };

  vips.Image.prototype.histLocal = function (width, height, options) {
    return vips.call('hist_local', this, width, height, options);
  };

  vips.Image.prototype.histMatch = function (ref, options) {
    return vips.call('hist_match', this, ref, options);
  };

  vips.Image.prototype.histNorm = function (options) {
    return vips.call('hist_norm', this, options);
  };

  vips.Image.prototype.histPlot = function (options) {
    return vips.call('hist_plot', this, options);
  };

  vips.Image.prototype.houghCircle = function (options) {
    return vips.call('hough_circle', this, options);
  };

  vips.Image.prototype.houghLine = function (options) {
    return vips.call('hough_line', this, options);
  };

  vips.Image.prototype.iccExport = function (options) {
    return vips.call('icc_export', this, options);
  };

  vips.Image.prototype.iccImport = function (options) {
    return vips.call('icc_import', this, options);
  };

  vips.Image.prototype.iccTransform = function (outputProfile, options) {
    return vips.call('icc_transform', this, outputProfile, options);
  };

  vips.Image.identity = function (options) {
    return vips.call('identity', options);
  };

  vips.Image.prototype.insert = function (sub, x, y, options) {
    return vips.call('insert', this, sub, x, y, options);
  };

  vips.Image.prototype.invert = function (options) {
    return vips.call('invert', this, options);
  };

  vips.Image.prototype.invertlut = function (options) {
    return vips.call('invertlut', this, options);
  };

  vips.Image.prototype.invfft = function (options) {
    return vips.call('invfft', this, options);
  };

  vips.Image.prototype.join = function (in2, direction, options) {
    return vips.call('join', this, in2, direction, options);
  };

  vips.Image.jpegload = function (filename, options) {
    return vips.call('jpegload', filename, options);
  };

  vips.Image.jpegloadBuffer = function (buffer, options) {
    return vips.call('jpegload_buffer', buffer, options);
  };

  vips.Image.prototype.jpegsave = function (filename, options) {
    return vips.call('jpegsave', this, filename, options);
  };

  vips.Image.prototype.jpegsaveBuffer = function (options) {
    return vips.call('jpegsave_buffer', this, options);
  };

  vips.Image.prototype.jpegsaveMime = function (options) {
    return vips.call('jpegsave_mime', this, options);
  };

  vips.Image.prototype.labelregions = function (options) {
    return vips.call('labelregions', this, options);
  };

  vips.Image.prototype.linear = function (a, b, options) {
    return vips.call('linear', this, a, b, options);
  };

  vips.Image.prototype.linecache = function (options) {
    return vips.call('linecache', this, options);
  };

  vips.Image.logmat = function (sigma, minAmpl, options) {
    return vips.call('logmat', sigma, minAmpl, options);
  };

  vips.Image.magickload = function (filename, options) {
    return vips.call('magickload', filename, options);
  };

  vips.Image.magickloadBuffer = function (buffer, options) {
    return vips.call('magickload_buffer', buffer, options);
  };

  vips.Image.prototype.magicksave = function (filename, options) {
    return vips.call('magicksave', this, filename, options);
  };

  vips.Image.prototype.magicksaveBuffer = function (options) {
    return vips.call('magicksave_buffer', this, options);
  };

  vips.Image.prototype.mapim = function (index, options) {
    return vips.call('mapim', this, index, options);
  };

  vips.Image.prototype.maplut = function (lut, options) {
    return vips.call('maplut', this, lut, options);
  };

  vips.Image.maskButterworth = function (width, height, order, frequencyCutoff, amplitudeCutoff, options) {
    return vips.call('mask_butterworth', width, height, order, frequencyCutoff, amplitudeCutoff, options);
  };

  vips.Image.maskButterworthBand = function (width, height, order, frequencyCutoffX, frequencyCutoffY, radius, amplitudeCutoff, options) {
    return vips.call('mask_butterworth_band', width, height, order, frequencyCutoffX, frequencyCutoffY, radius, amplitudeCutoff, options);
  };

  vips.Image.maskButterworthRing = function (width, height, order, frequencyCutoff, amplitudeCutoff, ringwidth, options) {
    return vips.call('mask_butterworth_ring', width, height, order, frequencyCutoff, amplitudeCutoff, ringwidth, options);
  };

  vips.Image.maskFractal = function (width, height, fractalDimension, options) {
    return vips.call('mask_fractal', width, height, fractalDimension, options);
  };

  vips.Image.maskGaussian = function (width, height, frequencyCutoff, amplitudeCutoff, options) {
    return vips.call('mask_gaussian', width, height, frequencyCutoff, amplitudeCutoff, options);
  };

  vips.Image.maskGaussianBand = function (width, height, frequencyCutoffX, frequencyCutoffY, radius, amplitudeCutoff, options) {
    return vips.call('mask_gaussian_band', width, height, frequencyCutoffX, frequencyCutoffY, radius, amplitudeCutoff, options);
  };

  vips.Image.maskGaussianRing = function (width, height, frequencyCutoff, amplitudeCutoff, ringwidth, options) {
    return vips.call('mask_gaussian_ring', width, height, frequencyCutoff, amplitudeCutoff, ringwidth, options);
  };

  vips.Image.maskIdeal = function (width, height, frequencyCutoff, options) {
    return vips.call('mask_ideal', width, height, frequencyCutoff, options);
  };

  vips.Image.maskIdealBand = function (width, height, frequencyCutoffX, frequencyCutoffY, radius, options) {
    return vips.call('mask_ideal_band', width, height, frequencyCutoffX, frequencyCutoffY, radius, options);
  };

  vips.Image.maskIdealRing = function (width, height, frequencyCutoff, ringwidth, options) {
    return vips.call('mask_ideal_ring', width, height, frequencyCutoff, ringwidth, options);
  };

  vips.Image.prototype.match = function (sec, xr1, yr1, xs1, ys1, xr2, yr2, xs2, ys2, options) {
    return vips.call('match', this, sec, xr1, yr1, xs1, ys1, xr2, yr2, xs2, ys2, options);
  };

  vips.Image.prototype.math = function (math, options) {
    return vips.call('math', this, math, options);
  };

  vips.Image.prototype.math2 = function (right, math2, options) {
    return vips.call('math2', this, right, math2, options);
  };

  vips.Image.prototype.math2Const = function (math2, c, options) {
    return vips.call('math2_const', this, math2, c, options);
  };

  vips.Image.matload = function (filename, options) {
    return vips.call('matload', filename, options);
  };

  vips.Image.matrixload = function (filename, options) {
    return vips.call('matrixload', filename, options);
  };

  vips.Image.prototype.matrixprint = function (options) {
    return vips.call('matrixprint', this, options);
  };

  vips.Image.prototype.matrixsave = function (filename, options) {
    return vips.call('matrixsave', this, filename, options);
  };

  vips.Image.prototype.max = function (options) {
    return vips.call('max', this, options);
  };

  vips.Image.prototype.measure = function (h, v, options) {
    return vips.call('measure', this, h, v, options);
  };

  vips.Image.prototype.merge = function (sec, direction, dx, dy, options) {
    return vips.call('merge', this, sec, direction, dx, dy, options);
  };

  vips.Image.prototype.min = function (options) {
    return vips.call('min', this, options);
  };

  vips.Image.prototype.morph = function (mask, morph, options) {
    return vips.call('morph', this, mask, morph, options);
  };

  vips.Image.prototype.mosaic = function (sec, direction, xref, yref, xsec, ysec, options) {
    return vips.call('mosaic', this, sec, direction, xref, yref, xsec, ysec, options);
  };

  vips.Image.prototype.mosaic1 = function (sec, direction, xr1, yr1, xs1, ys1, xr2, yr2, xs2, ys2, options) {
    return vips.call('mosaic1', this, sec, direction, xr1, yr1, xs1, ys1, xr2, yr2, xs2, ys2, options);
  };

  vips.Image.prototype.msb = function (options) {
    return vips.call('msb', this, options);
  };

  vips.Image.niftiload = function (filename, options) {
    return vips.call('niftiload', filename, options);
  };

  vips.Image.prototype.niftisave = function (filename, options) {
    return vips.call('niftisave', this, filename, options);
  };

  vips.Image.openexrload = function (filename, options) {
    return vips.call('openexrload', filename, options);
  };

  vips.Image.openslideload = function (filename, options) {
    return vips.call('openslideload', filename, options);
  };

  vips.Image.pdfload = function (filename, options) {
    return vips.call('pdfload', filename, options);
  };

  vips.Image.pdfloadBuffer = function (buffer, options) {
    return vips.call('pdfload_buffer', buffer, options);
  };

  vips.Image.prototype.percent = function (percent, options) {
    return vips.call('percent', this, percent, options);
  };

  vips.Image.perlin = function (width, height, options) {
    return vips.call('perlin', width, height, options);
  };

  vips.Image.prototype.phasecor = function (in2, options) {
    return vips.call('phasecor', this, in2, options);
  };

  vips.Image.pngload = function (filename, options) {
    return vips.call('pngload', filename, options);
  };

  vips.Image.pngloadBuffer = function (buffer, options) {
    return vips.call('pngload_buffer', buffer, options);
  };

  vips.Image.prototype.pngsave = function (filename, options) {
    return vips.call('pngsave', this, filename, options);
  };

  vips.Image.prototype.pngsaveBuffer = function (options) {
    return vips.call('pngsave_buffer', this, options);
  };

  vips.Image.ppmload = function (filename, options) {
    return vips.call('ppmload', filename, options);
  };

  vips.Image.prototype.ppmsave = function (filename, options) {
    return vips.call('ppmsave', this, filename, options);
  };

  vips.Image.prototype.premultiply = function (options) {
    return vips.call('premultiply', this, options);
  };

  vips.Image.prototype.profile = function (options) {
    return vips.call('profile', this, options);
  };

  vips.Image.prototype.project = function (options) {
    return vips.call('project', this, options);
  };

  vips.Image.prototype.quadratic = function (coeff, options) {
    return vips.call('quadratic', this, coeff, options);
  };

  vips.Image.prototype.rad2float = function (options) {
    return vips.call('rad2float', this, options);
  };

  vips.Image.radload = function (filename, options) {
    return vips.call('radload', filename, options);
  };

  vips.Image.prototype.radsave = function (filename, options) {
    return vips.call('radsave', this, filename, options);
  };

  vips.Image.prototype.radsaveBuffer = function (options) {
    return vips.call('radsave_buffer', this, options);
  };

  vips.Image.prototype.rank = function (width, height, index, options) {
    return vips.call('rank', this, width, height, index, options);
  };

  vips.Image.rawload = function (filename, width, height, bands, options) {
    return vips.call('rawload', filename, width, height, bands, options);
  };

  vips.Image.prototype.rawsave = function (filename, options) {
    return vips.call('rawsave', this, filename, options);
  };

  vips.Image.prototype.rawsaveFd = function (fd, options) {
    return vips.call('rawsave_fd', this, fd, options);
  };

  vips.Image.prototype.recomb = function (m, options) {
    return vips.call('recomb', this, m, options);
  };

  vips.Image.prototype.reduce = function (hshrink, vshrink, options) {
    return vips.call('reduce', this, hshrink, vshrink, options);
  };

  vips.Image.prototype.reduceh = function (hshrink, options) {
    return vips.call('reduceh', this, hshrink, options);
  };

  vips.Image.prototype.reducev = function (vshrink, options) {
    return vips.call('reducev', this, vshrink, options);
  };

  vips.Image.prototype.relational = function (right, relational, options) {
    return vips.call('relational', this, right, relational, options);
  };

  vips.Image.prototype.relationalConst = function (relational, c, options) {
    return vips.call('relational_const', this, relational, c, options);
  };

  vips.Image.prototype.remainder = function (right, options) {
    return vips.call('remainder', this, right, options);
  };

  vips.Image.prototype.remainderConst = function (c, options) {
    return vips.call('remainder_const', this, c, options);
  };

  vips.Image.prototype.replicate = function (across, down, options) {
    return vips.call('replicate', this, across, down, options);
  };

  vips.Image.prototype.resize = function (scale, options) {
    return vips.call('resize', this, scale, options);
  };

  vips.Image.prototype.rot = function (angle, options) {
    return vips.call('rot', this, angle, options);
  };

  vips.Image.prototype.rot45 = function (options) {
    return vips.call('rot45', this, options);
  };

  vips.Image.prototype.rotate = function (angle, options) {
    return vips.call('rotate', this, angle, options);
  };

  vips.Image.prototype.round = function (round, options) {
    return vips.call('round', this, round, options);
  };

  vips.Image.prototype.sRGB2HSV = function (options) {
    return vips.call('sRGB2HSV', this, options);
  };

  vips.Image.prototype.sRGB2scRGB = function (options) {
    return vips.call('sRGB2scRGB', this, options);
  };

  vips.Image.prototype.scRGB2BW = function (options) {
    return vips.call('scRGB2BW', this, options);
  };

  vips.Image.prototype.scRGB2XYZ = function (options) {
    return vips.call('scRGB2XYZ', this, options);
  };

  vips.Image.prototype.scRGB2sRGB = function (options) {
    return vips.call('scRGB2sRGB', this, options);
  };

  vips.Image.prototype.scale = function (options) {
    return vips.call('scale', this, options);
  };

  vips.Image.prototype.sequential = function (options) {
    return vips.call('sequential', this, options);
  };

  vips.Image.prototype.sharpen = function (options) {
    return vips.call('sharpen', this, options);
  };

  vips.Image.prototype.shrink = function (hshrink, vshrink, options) {
    return vips.call('shrink', this, hshrink, vshrink, options);
  };

  vips.Image.prototype.shrinkh = function (hshrink, options) {
    return vips.call('shrinkh', this, hshrink, options);
  };

  vips.Image.prototype.shrinkv = function (vshrink, options) {
    return vips.call('shrinkv', this, vshrink, options);
  };

  vips.Image.prototype.sign = function (options) {
    return vips.call('sign', this, options);
  };

  vips.Image.prototype.similarity = function (options) {
    return vips.call('similarity', this, options);
  };

  vips.Image.sines = function (width, height, options) {
    return vips.call('sines', width, height, options);
  };

  vips.Image.prototype.smartcrop = function (width, height, options) {
    return vips.call('smartcrop', this, width, height, options);
  };

  vips.Image.prototype.sobel = function (options) {
    return vips.call('sobel', this, options);
  };

  vips.Image.prototype.spcor = function (ref, options) {
    return vips.call('spcor', this, ref, options);
  };

  vips.Image.prototype.spectrum = function (options) {
    return vips.call('spectrum', this, options);
  };

  vips.Image.prototype.stats = function (options) {
    return vips.call('stats', this, options);
  };

  vips.Image.prototype.stdif = function (width, height, options) {
    return vips.call('stdif', this, width, height, options);
  };

  vips.Image.prototype.subsample = function (xfac, yfac, options) {
    return vips.call('subsample', this, xfac, yfac, options);
  };

  vips.Image.sum = function (input, options) {
    return vips.call('sum', input, options);
  };

  vips.Image.svgload = function (filename, options) {
    return vips.call('svgload', filename, options);
  };

  vips.Image.svgloadBuffer = function (buffer, options) {
    return vips.call('svgload_buffer', buffer, options);
  };

  vips.Image.system = function (cmdFormat, options) {
    return vips.call('system', cmdFormat, options);
  };

  vips.Image.text = function (text, options) {
    return vips.call('text', text, options);
  };

  vips.Image.thumbnail = function (filename, width, options) {
    return vips.call('thumbnail', filename, width, options);
  };

  vips.Image.thumbnailBuffer = function (buffer, width, options) {
    return vips.call('thumbnail_buffer', buffer, width, options);
  };

  vips.Image.prototype.thumbnailImage = function (width, options) {
    return vips.call('thumbnail_image', this, width, options);
  };

  vips.Image.tiffload = function (filename, options) {
    return vips.call('tiffload', filename, options);
  };

  vips.Image.tiffloadBuffer = function (buffer, options) {
    return vips.call('tiffload_buffer', buffer, options);
  };

  vips.Image.prototype.tiffsave = function (filename, options) {
    return vips.call('tiffsave', this, filename, options);
  };

  vips.Image.prototype.tiffsaveBuffer = function (options) {
    return vips.call('tiffsave_buffer', this, options);
  };

  vips.Image.prototype.tilecache = function (options) {
    return vips.call('tilecache', this, options);
  };

  vips.Image.tonelut = function (options) {
    return vips.call('tonelut', options);
  };

  vips.Image.prototype.transpose3d = function (options) {
    return vips.call('transpose3d', this, options);
  };

  vips.Image.prototype.unpremultiply = function (options) {
    return vips.call('unpremultiply', this, options);
  };

  vips.Image.vipsload = function (filename, options) {
    return vips.call('vipsload', filename, options);
  };

  vips.Image.prototype.vipssave = function (filename, options) {
    return vips.call('vipssave', this, filename, options);
  };

  vips.Image.webpload = function (filename, options) {
    return vips.call('webpload', filename, options);
  };

  vips.Image.webploadBuffer = function (buffer, options) {
    return vips.call('webpload_buffer', buffer, options);
  };

  vips.Image.prototype.webpsave = function (filename, options) {
    return vips.call('webpsave', this, filename, options);
  };

  vips.Image.prototype.webpsaveBuffer = function (options) {
    return vips.call('webpsave_buffer', this, options);
  };

  vips.Image.worley = function (width, height, options) {
    return vips.call('worley', width, height, options);
  };

  vips.Image.prototype.wrap = function (options) {
    return vips.call('wrap', this, options);
  };

  vips.Image.xyz = function (width, height, options) {
    return vips.call('xyz', width, height, options);
  };

  vips.Image.zone = function (width, height, options) {
    return vips.call('zone', width, height, options);
  };

  vips.Image.prototype.zoom = function (xfac, yfac, options) {
    return vips.call('zoom', this, xfac, yfac, options);
  };
};
