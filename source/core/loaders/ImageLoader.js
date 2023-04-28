'use strict';

/**
 * ImageLoader can be used to load external image resources.
 *
 * @class ImageLoader
 * @module Loaders
 * @param {Object} manager
 */
function ImageLoader(manager) {
  this.manager = manager !== undefined ? manager : THREE.DefaultLoadingManager;

  this.path = '';
  this.crossOrigin = 'Anonymous';
}

/**
 * Set cross origin path for the loader.
 *
 * @method setCrossOrigin
 * @param {String} url URL.
 * @return {ImageLoader} Self for chaining.
 */
ImageLoader.prototype.setCrossOrigin = function (url) {
  // this.crossOrigin = url;
  return this;
};

/**
 * Set base path for texture loading.
 *
 * @method setPath
 * @param {String} path Path
 * @return {ImageLoader} Self for chaining.
 */
ImageLoader.prototype.setPath = function (path) {
  this.path = path;
  return this;
};

/**
 * Load image resource from url.
 *
 * @method loadJSON
 * @param {String} url
 * @param {Function} onLoad
 * @param {Function} onProgress
 * @param {Function} onError
 */
ImageLoader.prototype.loadJSON = function (url, onLoad, onProgress, onError) {
  var self = this;

  var loader = new THREE.FileLoader(this.manager);
  loader.load(
    url,
    function (text) {
      onLoad(self.parse(JSON.parse(text)));
    },
    onProgress,
    onError
  );
};

/**
 * Parse image json and return resource.
 *
 * @method parse
 * @param {Object} json
 * @return {Image} Image resource
 */
ImageLoader.prototype.parse = function (json) {
  try {
    var image = new Image(
      json.data.toArrayBuffer !== undefined ? json.data.toArrayBuffer() : json.data,
      json.encoding
    );

    image.name = json.name;
    image.uuid = json.uuid;

    if (json.width !== undefined) {
      image.width = json.width;
      image.height = json.height;
    }

    return image;
  } catch (error) {
    console.log(error);
    return null;
  }
};
