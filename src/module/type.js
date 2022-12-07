/**
 * 节点类型
 */
define(function (require, exports, module) {
  var GlobalMappingKey = "_MinderTypeMapping";

  var kity = require("../core/kity");
  var Command = require("../core/command");
  var Module = require("../core/module");
  var Renderer = require("../core/render");
  var Minder = require("../core/minder");

  Module.register("Type", function () {
    function getTypeByKey(key) {
      return window[GlobalMappingKey][key];
    }

    kity.extendClass(Minder, {
      getTypeMapping: function () {
        return window[GlobalMappingKey];
      },
      getTypeByKey: getTypeByKey,
    });

    var TypeCommand = kity.createClass("TypeCommand", {
      base: Command,

      execute: function (minder, type) {
        var nodes = minder.getSelectedNodes();
        nodes.forEach(function (node) {
          node.setData("type", type).render();
        });

        minder.layout(200);
      },

      queryValue: function (minder) {
        var node = minder.getSelectedNode();
        return (node && node.getData("type")) || null;
      },

      queryState: function (km) {
        return km.getSelectedNode() ? 0 : -1;
      },
    });

    /**
     * @class 资源的覆盖图形
     *
     * 该类为一个资源以指定的颜色渲染一个动态的覆盖图形
     */
    var TypeOverlay = kity.createClass("TypeOverlay", {
      base: kity.Group,

      constructor: function () {
        this.callBase();
      },

      setValue: function (type) {
        var typeData = getTypeByKey(type);
        // 合并样式数据
        var style = Object.assign(
          {},
          {
            fontSize: 12,
            paddingX: 6,
            paddingY: 4,
            verticalAlign: "middle",
            boarderRadius: 2,
            color: "#333",
            background: "transparent",
          },
          typeData.style
        );

        var text = new kity.Text()
          .setFontSize(style.fontSize)
          .setVerticalAlign(style.verticalAlign);
        var rect = new kity.Rect();
        var box;

        this.addShapes([rect, text]);

        var name = typeData.name;

        if (type == this.lastType) {
          box = this.lastBox;
        } else {
          text.setContent(name);
          box = text.getBoundaryBox();
          this.lastType = type;
          this.lastBox = box;
        }

        text.setX(style.paddingX).fill(style.color);
        this.width = Math.round(box.width + style.paddingX * 2);
        this.height = Math.round(box.height + style.paddingY * 2);

        rect
          .setSize(this.width, this.height)
          .setPosition(0, box.y - style.paddingY)
          .setRadius(style.boarderRadius)
          .fill(style.background);
      },
    });

    /**
     * @class 资源渲染器
     */
    var TypeRenderer = kity.createClass("TypeRenderer", {
      base: Renderer,
      create: function (node) {
        return new kity.Group();
      },

      shouldRender: function (node) {
        const type = node.getData("type");
        return type && getTypeByKey(type);
      },

      update: function (container, node, box) {
        var spaceRight = node.getStyle("space-right");
        var type = node.getData("type");
        // hideTypeRect 需要隐藏节点类型展示
        if (!type || getTypeByKey(type).hideTypeRect) return;

        //var index = node.getIndex() || 0;
        var overlay = new TypeOverlay();
        container.addShape(overlay);
        overlay.setVisible(true);
        overlay.setValue(type);
        overlay.setTranslate(spaceRight, -1);

        container.setTranslate(box.right, 0);

        return new kity.Box({
          x: box.right + overlay.width,
          y: Math.round(-overlay.height / 2),
          width: spaceRight,
          height: overlay.height,
        });
      },
    });

    return {
      init: function (options) {
        if (
          options.moduleOptions &&
          Array.isArray(options.moduleOptions.type)
        ) {
          window[GlobalMappingKey] = options.moduleOptions.type.reduce(
            function (res, item) {
              res[item.key] = item;
              return res;
            },
            {}
          );
          this.setOption("typeMapping", window[GlobalMappingKey]);
        }
      },

      commands: {
        type: TypeCommand,
      },

      renderers: {
        right: TypeRenderer,
      },
    };
  });
});
