'use strict';

function TextureForm(parent) {
  TextureChooser.call(this, parent);

  this.element.style.overflow = 'visible';

  this.form = new TableForm(this);
  this.form.defaultTextWidth = 60;

  //Use texture
  this.form.addText('Use texture');
  this.useTexture = new CheckBox(this.form);
  this.useTexture.size.set(18, 18);
  this.form.add(this.useTexture);
  this.form.nextRow();

  //WrapS
  this.form.addText('Wrap Hor');
  this.wrapS = new DropdownList(this);
  this.wrapS.size.set(120, 18);
  this.wrapS.addValue(Locale.clampEdge, THREE.ClampToEdgeWrapping);
  this.wrapS.addValue(Locale.repeat, THREE.RepeatWrapping);
  this.wrapS.addValue(Locale.repeatMirror, THREE.MirroredRepeatWrapping);
  this.form.add(this.wrapS);
  this.form.nextRow();

  //WrapT
  this.form.addText('Wrap Vert');
  this.wrapT = new DropdownList(this);
  this.wrapT.size.set(120, 18);
  this.wrapT.addValue(Locale.clampEdge, THREE.ClampToEdgeWrapping);
  this.wrapT.addValue(Locale.repeat, THREE.RepeatWrapping);
  this.wrapT.addValue(Locale.repeatMirror, THREE.MirroredRepeatWrapping);
  this.form.add(this.wrapT);
  this.form.nextRow();

  //Repeat
  this.form.addText(Locale.repeat);
  this.repeat = new VectorBox(this);
  this.repeat.setType(VectorBox.VECTOR2);
  this.repeat.size.set(120, 18);
  this.repeat.setValue(1, 1, 0);
  this.form.add(this.repeat);
}

TextureForm.prototype = Object.create(TextureChooser.prototype);

/**
 * Set onchange callback, called after changes.
 *
 * @method setOnChange
 * @param {Function} onChange
 */
TextureForm.prototype.setOnChange = function (onChange) {
  TextureChooser.prototype.setOnChange.call(this, onChange);

  this.useTexture.setOnChange(onChange);
  this.wrapT.setOnChange(onChange);
  this.wrapS.setOnChange(onChange);
  this.repeat.setOnChange(onChange);
};

/**
 * Set value stored in the input element.
 *
 * @method setValue
 * @param {Object} texture
 */
TextureForm.prototype.setValue = function (texture) {
  if (texture instanceof THREE.Texture && !texture.isCubeTexture) {
    this.texture = texture;

    this.useTexture.setValue(true);
    this.wrapS.setValue(texture.wrapS);
    this.wrapT.setValue(texture.wrapT);
    this.repeat.setValue(texture.repeat.x, texture.repeat.y);

    this.updatePreview();
  } else {
    this.texture = null;
  }
};

/**
 * Get value stored in the input element.
 *
 * @method getValue
 * @return {Object} Value stored in the input element.
 */
TextureForm.prototype.getValue = function () {
  if (this.useTexture.getValue()) {
    if (this.texture !== null) {
      this.texture.wrapS = this.wrapS.getValue();
      this.texture.wrapT = this.wrapT.getValue();
      this.texture.repeat.copy(this.repeat.getValue());
      this.texture.needsUpdate = true;

      return this.texture;
    }
  }

  return null;
};

//Load texture from file
TextureForm.prototype.loadTexture = function (file) {
  var self = this;
  var onLoad = function (texture) {
    self.texture = texture;
    console.log(texture);
    self.useTexture.setValue(true);
    self.updatePreview();

    if (self.onChange !== null) {
      self.onChange();
    }
  };

  if (Image.fileIsImage(file)) {
    Editor.loadTexture(file, onLoad);
  } else if (Video.fileIsVideo(file)) {
    Editor.loadVideoTexture(file, onLoad);
  }
};

TextureForm.prototype.updateSize = function () {
  TextureChooser.prototype.updateSize.call(this);

  this.form.position.set(this.size.y + 5, 0);
  this.form.size.set(this.size.x - this.form.position.x, this.size.y);
  this.form.updateInterface();
};
