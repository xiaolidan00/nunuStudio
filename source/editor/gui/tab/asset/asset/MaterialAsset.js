'use strict';

function openMaterialEditor(self) {
  if (self.asset instanceof THREE.Material) {
    var tab = Editor.gui.tab.getTab(MaterialEditor, self.asset);

    if (tab === null) {
      self.restoreMaterial();

      if (self.asset instanceof THREE.MeshPhongMaterial) {
        tab = Editor.gui.tab.addTab(MeshPhongMaterialEditor, true);
      } else if (self.asset instanceof THREE.MeshLambertMaterial) {
        tab = Editor.gui.tab.addTab(MeshLambertMaterialEditor, true);
      } else if (self.asset instanceof THREE.MeshMatcapMaterial) {
        tab = Editor.gui.tab.addTab(MeshMatcapMaterialEditor, true);
      } else if (self.asset instanceof THREE.MeshBasicMaterial) {
        tab = Editor.gui.tab.addTab(MeshBasicMaterialEditor, true);
      } else if (self.asset instanceof THREE.MeshPhysicalMaterial) {
        tab = Editor.gui.tab.addTab(MeshPhysicalMaterialEditor, true);
      } else if (self.asset instanceof THREE.MeshStandardMaterial) {
        tab = Editor.gui.tab.addTab(MeshStandardMaterialEditor, true);
      } else if (self.asset instanceof THREE.SpriteMaterial) {
        tab = Editor.gui.tab.addTab(SpriteMaterialEditor, true);
      } else if (self.asset instanceof THREE.ShaderMaterial) {
        tab = Editor.gui.tab.addTab(ShaderMaterialEditor, true);
      } else if (self.asset instanceof THREE.LineDashedMaterial) {
        tab = Editor.gui.tab.addTab(LineDashedMaterialEditor, true);
      } else if (self.asset instanceof THREE.LineBasicMaterial) {
        tab = Editor.gui.tab.addTab(LineBasicMaterialEditor, true);
      } else if (self.asset instanceof THREE.PointsMaterial) {
        tab = Editor.gui.tab.addTab(PointsMaterialEditor, true);
      } else {
        tab = Editor.gui.tab.addTab(MeshMaterialEditor, true);
      }

      tab.attach(self.asset, self);
    }

    tab.select();
  }
}
function MaterialAsset(parent) {
  Asset.call(this, parent);

  this.setIcon(Global.FILE_PATH + 'icons/misc/material.png');

  var self = this;

  //Use to store original material color on highlight
  this.materialColor = new THREE.Color(0, 0, 0);
  this.materialHighlighted = false;

  //Material Preview
  this.image = document.createElement('img');
  this.image.style.position = 'absolute';
  this.image.style.top = '5%';
  this.image.style.left = '17%';
  this.image.style.width = '66%';
  this.image.style.height = '66%';
  this.element.appendChild(this.image);

  //Mouse over event
  this.element.onmouseenter = function () {
    this.style.backgroundColor = Editor.theme.buttonOverColor;
    self.highlightMaterial();
  };

  //Mouse leave event
  this.element.onmouseleave = function () {
    if (!Editor.isSelected(self.asset)) {
      this.style.backgroundColor = null;
    }
    self.restoreMaterial();
  };

  //Double click
  this.element.ondblclick = function () {
    openMaterialEditor(self);
  };

  //Context menu event
  this.element.oncontextmenu = function (event) {
    var context = new ContextMenu(DocumentBody);
    context.size.set(130, 20);
    context.position.set(event.clientX, event.clientY);

    context.addOption(Locale.rename, function () {
      if (self.asset !== null) {
        Editor.addAction(
          new ChangeAction(self.asset, 'name', Editor.prompt('Rename material', self.asset.name))
        );
      }
    });

    context.addOption('Select objects', function () {
      Editor.clearSelection();
      Editor.program.traverse(function (child) {
        if (child.material === self.asset) {
          Editor.addToSelection(child);
        }
      });

      Editor.updateSelectionGUI();
    });

    context.addOption(Locale.delete, function () {
      if (self.asset !== null && confirm('Delete material?')) {
        Editor.addAction(new RemoveResourceAction(self.asset, Editor.program, 'materials'));
      }
    });

    context.addOption(Locale.copy, function () {
      if (self.asset !== null) {
        try {
          Editor.clipboard.set(JSON.stringify(self.asset.toJSON()), 'text');
        } catch (e) {}
      }
    });

    context.addOption(Locale.cut, function () {
      if (self.asset !== null) {
        try {
          Editor.clipboard.set(JSON.stringify(self.asset.toJSON()), 'text');
          Editor.addAction(new RemoveResourceAction(self.asset, Editor.program, 'materials'));
        } catch (e) {}
      }
    });

    context.addOption(Locale.duplicate, function () {
      if (self.asset !== null) {
        try {
          //Serialize
          var json = self.asset.toJSON();

          //Loader
          var loader = new MaterialLoader();
          loader.setTextures(Editor.program.textures);

          //Load
          var material = loader.parse(json);
          material.uuid = THREE.Math.generateUUID();

          //Add
          Editor.program.addMaterial(material);
          Editor.updateSelectionGUI();
        } catch (e) {
          Editor.alert('Material duplication failed\n' + e.stack);
        }
      }
    });

    context.updateInterface();
  };

  //Drag start
  this.element.ondragstart = function (event) {
    //Restore material color
    self.restoreMaterial();

    //Insert material into drag buffer
    if (self.asset !== null) {
      event.dataTransfer.setData('uuid', self.asset.uuid);
      DragBuffer.push(self.asset);
    }
  };

  //Drag end (called after of ondrop)
  this.element.ondragend = function (event) {
    DragBuffer.pop(self.asset.uuid);
  };
}

//Super prototypes
MaterialAsset.prototype = Object.create(Asset.prototype);

//Destroy material file
MaterialAsset.prototype.destroy = function () {
  Asset.prototype.destroy.call(this);

  this.restoreMaterial();
};

//Highlight material
MaterialAsset.prototype.highlightMaterial = function () {
  if (this.asset instanceof THREE.Material && this.asset.color !== undefined) {
    this.materialColor.copy(this.asset.color);
    this.asset.color.setRGB(1, 1, 0);
    this.materialHighlighted = true;
  }
};

//Restore material to normal color
MaterialAsset.prototype.restoreMaterial = function () {
  if (this.materialHighlighted) {
    if (this.asset instanceof THREE.Material && this.asset.color !== undefined) {
      this.asset.color.copy(this.materialColor);
      this.materialHighlighted = false;
    }
  }
};

MaterialAsset.prototype.updateMetadata = function () {
  if (this.asset !== null) {
    var image = this.image;

    MaterialRenderer.render(this.asset, function (url) {
      image.src = url;
    });

    this.setText(this.asset.name);
  }
};
