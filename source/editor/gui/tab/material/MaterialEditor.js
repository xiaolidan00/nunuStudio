'use strict';

function MaterialEditor(parent, closeable, container, index) {
  TabElement.call(
    this,
    parent,
    closeable,
    container,
    index,
    Locale.material,
    Global.FILE_PATH + 'icons/misc/material.png'
  );

  var self = this;

  //Canvas
  this.canvas = new RendererCanvas();

  this.canvas.setOnResize(function (x, y) {
    self.camera.aspect = x / y;
    self.camera.updateProjectionMatrix();
  });

  //Mouse
  this.mouse = new Mouse(window, true);
  this.mouse.setCanvas(this.canvas.element);

  //Material and corresponding asset
  this.material = null;
  this.asset = null;

  //Preview scene
  this.scene = new THREE.Scene();

  //Camera
  this.camera = new THREE.PerspectiveCamera(80, this.canvas.size.x / this.canvas.size.y);
  this.camera.position.set(0, 0, 2.5);

  //Interactive object
  this.interactive = new THREE.Object3D();
  this.scene.add(this.interactive);

  //Preview configuration
  this.previewForm = new TableForm();
  this.previewForm.setAutoSize(false);

  //Configuration text
  this.previewForm.addText('Configuration');
  this.previewForm.nextRow();

  //Form
  this.form = new TableForm();
  this.form.setAutoSize(false);

  //Name
  this.form.addText(Locale.name);
  this.name = new TextBox(this.form);
  this.name.size.set(200, 18);
  this.name.setOnChange(function () {
    Editor.addAction(new ChangeAction(self.material, 'name', self.name.getText()));
  });
  this.form.add(this.name);
  this.form.nextRow();

  //Side
  this.form.addText(Locale.side);
  this.side = new DropdownList(this.form);
  this.side.size.set(100, 18);
  this.side.addValue(Locale.front, THREE.FrontSide);
  this.side.addValue(Locale.back, THREE.BackSide);
  this.side.addValue(Locale.double, THREE.DoubleSide);
  this.side.setOnChange(function () {
    Editor.addAction(new ChangeAction(self.material, 'side', self.side.getValue()));
    self.material.needsUpdate = true;
  });
  this.form.add(this.side);
  this.form.nextRow();

  //Test depth
  this.form.addText(Locale.depthTest);
  this.depthTest = new CheckBox(this.form);
  this.depthTest.size.set(18, 18);
  this.depthTest.setOnChange(function () {
    Editor.addAction(new ChangeAction(self.material, 'depthTest', self.depthTest.getValue()));
    self.material.needsUpdate = true;
  });
  this.form.add(this.depthTest);
  this.form.nextRow();

  //Write depth
  this.form.addText(Locale.depthWrite);
  this.depthWrite = new CheckBox(this.form);
  this.depthWrite.size.set(18, 18);
  this.depthWrite.setOnChange(function () {
    Editor.addAction(new ChangeAction(self.material, 'depthWrite', self.depthWrite.getValue()));
    self.material.needsUpdate = true;
  });
  this.form.add(this.depthWrite);
  this.form.nextRow();

  //Depth mode
  this.form.addText(Locale.depthMode);
  this.depthFunc = new DropdownList(this.form);
  this.depthFunc.size.set(100, 18);
  this.depthFunc.addValue(Locale.never, THREE.NeverDepth);
  this.depthFunc.addValue(Locale.always, THREE.AlwaysDepth);
  this.depthFunc.addValue(Locale.less, THREE.LessDepth);
  this.depthFunc.addValue(Locale.lessOrEqual, THREE.LessEqualDepth);
  this.depthFunc.addValue(Locale.greaterOrEqual, THREE.GreaterEqualDepth);
  this.depthFunc.addValue(Locale.greater, THREE.GreaterDepth);
  this.depthFunc.addValue(Locale.notEqual, THREE.NotEqualDepth);
  this.depthFunc.setOnChange(function () {
    Editor.addAction(new ChangeAction(self.material, 'depthFunc', self.depthFunc.getValue()));
    self.material.needsUpdate = true;
  });
  this.form.add(this.depthFunc);
  this.form.nextRow();

  //Transparent
  this.form.addText(Locale.transparent);
  this.transparent = new CheckBox(this.form);
  this.transparent.size.set(18, 18);
  this.transparent.setOnChange(function () {
    Editor.addAction(new ChangeAction(self.material, 'transparent', self.transparent.getValue()));
    self.material.needsUpdate = true;
  });
  this.form.add(this.transparent);
  this.form.nextRow();

  //Opacity level
  this.form.addText(Locale.opacity);
  this.opacity = new Slider(this.form);
  this.opacity.size.set(160, 18);
  this.opacity.setRange(0, 1);
  this.opacity.setStep(0.01);
  this.opacity.setOnChange(function () {
    Editor.addAction(new ChangeAction(self.material, 'opacity', self.opacity.getValue()));
    self.material.needsUpdate = true;
  });
  this.form.add(this.opacity);
  this.form.nextRow();

  //Alpha test
  this.form.addText(Locale.alphaTest);
  this.alphaTest = new Slider(this.form);
  this.alphaTest.size.set(160, 18);
  this.alphaTest.setRange(0, 1);
  this.alphaTest.setStep(0.01);
  this.alphaTest.setOnChange(function () {
    Editor.addAction(new ChangeAction(self.material, 'alphaTest', self.alphaTest.getValue()));
    self.material.needsUpdate = true;
  });
  this.form.add(this.alphaTest);
  this.form.nextRow();

  //Blending mode
  this.form.addText(Locale.blendingMode);
  this.blending = new DropdownList(this.form);
  this.blending.size.set(100, 18);
  this.blending.addValue(Locale.none, THREE.NoBlending);
  this.blending.addValue(Locale.normal, THREE.NormalBlending);
  this.blending.addValue(Locale.additive, THREE.AdditiveBlending);
  this.blending.addValue(Locale.subtractive, THREE.SubtractiveBlending);
  this.blending.addValue(Locale.multiply, THREE.MultiplyBlending);
  this.blending.setOnChange(function () {
    Editor.addAction(new ChangeAction(self.material, 'blending', self.blending.getValue()));
    self.material.needsUpdate = true;
  });
  this.form.add(this.blending);
  this.form.nextRow();

  //Preview
  this.preview = new DualContainer();
  this.preview.orientation = DualDivision.VERTICAL;
  this.preview.tabPosition = 0.8;
  this.preview.tabPositionMin = 0.3;
  this.preview.tabPositionMax = 0.8;
  this.preview.attachA(this.canvas);
  this.preview.attachB(this.previewForm);

  //Main
  this.main = new DualContainer(this);
  this.main.tabPosition = 0.5;
  this.main.tabPositionMin = 0.05;
  this.main.tabPositionMax = 0.95;
  this.main.attachA(this.preview);
  this.main.attachB(this.form);
}

MaterialEditor.geometries = [
  [Locale.sphere, new THREE.SphereBufferGeometry(1, 40, 40)],
  [Locale.torus, new THREE.TorusBufferGeometry(0.8, 0.4, 32, 64)],
  [Locale.cube, new THREE.BoxBufferGeometry(1, 1, 1, 1, 1, 1)],
  [Locale.torusKnot, new THREE.TorusKnotBufferGeometry(0.7, 0.3, 128, 64)],
  [Locale.cone, new THREE.ConeBufferGeometry(1, 2, 32)]
];

MaterialEditor.prototype = Object.create(TabElement.prototype);

//Attach material to material editor
MaterialEditor.prototype.attach = function (material, asset) {
  //Material asset
  if (asset !== undefined) {
    this.asset = asset;
  }

  //Store material
  this.material = material;
  this.material.needsUpdate = true;

  this.updateMetadata();

  //Generic material elements
  this.name.setText(material.name);
  this.side.setValue(material.side);
  this.depthTest.setValue(material.depthTest);
  this.depthWrite.setValue(material.depthWrite);
  this.depthFunc.setValue(material.depthFunc);
  this.transparent.setValue(material.transparent);
  this.opacity.setValue(material.opacity);
  this.alphaTest.setValue(material.alphaTest);
  this.blending.setValue(material.blending);
};

MaterialEditor.prototype.isAttached = function (material) {
  return this.material === material;
};

MaterialEditor.prototype.activate = function () {
  TabElement.prototype.activate.call(this);

  this.mouse.create();
};

MaterialEditor.prototype.deactivate = function () {
  TabElement.prototype.deactivate.call(this);

  this.mouse.dispose();
};

MaterialEditor.prototype.destroy = function () {
  TabElement.prototype.destroy.call(this);

  this.mouse.dispose();
  this.canvas.destroy();
};

//Update object data
MaterialEditor.prototype.updateMetadata = function () {
  if (this.material !== null) {
    //Set name
    if (this.material.name !== undefined) {
      this.setName(this.material.name);
      this.name.setText(this.material.name);
      Editor.gui.tree.updateObjsMatName(this.material);
    }

    this.scene.background = this.material.envMap !== null ? this.material.envMap : null;

    //If not found close tab
    if (Editor.program.materials[this.material.uuid] === undefined) {
      this.close();
    }
  }
};

//Update material editor
MaterialEditor.prototype.update = function () {
  this.mouse.update();

  //Render Material
  if (this.material !== null) {
    //If needs update file metadata
    if (this.material.needsUpdate) {
      Editor.updateObjectsViewsGUI();

      this.scene.background = this.material.envMap !== null ? this.material.envMap : null;

      this.material.needsUpdate = true;
    }

    //Render scene
    this.canvas.renderer && this.canvas.renderer.render(this.scene, this.camera);
  }

  //Move material view
  if (this.mouse.insideCanvas()) {
    //Zoom
    this.camera.position.z += this.camera.position.z * this.mouse.wheel * 0.001;

    //Rotate object
    if (this.mouse.buttonPressed(Mouse.LEFT)) {
      var delta = new THREE.Quaternion();
      delta.setFromEuler(
        new THREE.Euler(this.mouse.delta.y * 0.005, this.mouse.delta.x * 0.005, 0, 'XYZ')
      );

      this.interactive.quaternion.multiplyQuaternions(delta, this.interactive.quaternion);
    }
  }
};

//Update elements
MaterialEditor.prototype.updateSize = function () {
  TabElement.prototype.updateSize.call(this);

  this.main.size.copy(this.size);
  this.main.updateInterface();

  this.previewForm.updateInterface();
  this.form.updateInterface();
};
