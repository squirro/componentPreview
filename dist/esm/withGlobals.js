function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

function _iterableToArrayLimit(arr, i) { var _i = arr && (typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"]); if (_i == null) return; var _arr = []; var _n = true; var _d = false; var _s, _e; try { for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

import { useEffect, useGlobals, useArgs } from "@storybook/addons";
import tippy from "tippy.js";
import 'tippy.js/dist/tippy.css';
import { linkTo } from "@storybook/addon-links";
import React from "react"; // @ts-ignore

import styled from '@emotion/styled';
var ComponentWrapper = styled.div({
  position: 'relative',
  cursor: 'pointer',
  '&:before': {
    content: '""',
    background: 'transparent',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    display: 'block',
    zIndex: 80,
    border: '1px solid transparent'
  },
  '&:hover:before': {
    background: 'rgba(0,114,171,0.37)',
    border: '1px solid #000'
  }
});

var ComponentPreviewWrapper = function ComponentPreviewWrapper(children, componentName, widgetStorybookName) {
  var _children$key;

  var isComponentWrapper = componentName.includes('Wrapper');
  var hasPreviewAlready = (_children$key = children.key) === null || _children$key === void 0 ? void 0 : _children$key.includes('preview-wrapper');

  if (hasPreviewAlready) {
    return children;
  }

  return /*#__PURE__*/React.createElement(ComponentWrapper, {
    key: "preview-wrapper-".concat(componentName),
    "data-tippy-content": componentName,
    "data-tippy-placement": isComponentWrapper ? 'left' : 'top-start',
    onClick: function onClick(e) {
      e.stopPropagation();
      linkTo("".concat(widgetStorybookName, "/").concat(componentName))();
    }
  }, children);
};

var wrapComponentsWithPreviewWrapper = function wrapComponentsWithPreviewWrapper(componentDeps, widgetLocation) {
  var wrappedDeps = {};
  console.log(componentDeps);
  Object.keys(componentDeps).forEach(function (componentName) {
    wrappedDeps[componentName] = function (props) {
      var children = typeof componentDeps[componentName] === 'function' ? componentDeps[componentName](props) : componentDeps[componentName];
      return ComponentPreviewWrapper(children, componentName, widgetLocation);
    };
  });
  return wrappedDeps;
};

export var withGlobals = function withGlobals(StoryFn, context) {
  var _useGlobals = useGlobals(),
      _useGlobals2 = _slicedToArray(_useGlobals, 1),
      outlineActive = _useGlobals2[0].outlineActive;

  var _useArgs = useArgs(),
      _useArgs2 = _slicedToArray(_useArgs, 2),
      args = _useArgs2[0],
      updateArgs = _useArgs2[1];

  var widgetLocation = function widgetLocation() {
    var index = context.kind.lastIndexOf("/");
    return context.kind.substring(0, index);
  };

  useEffect(function () {
    // Execute your side effect here
    // For example, to manipulate the contents of the preview
    var overrides = context.args.overrides;
    var overridesOld = context.args.overridesOld; // these updates are little hacky, but it works. Everything else I tried produces infinite loop. Didn't spend too much time on it.

    if (overrides || overridesOld) {
      if (outlineActive) {
        updateArgs({
          overrides: wrapComponentsWithPreviewWrapper(overrides || overridesOld, widgetLocation())
        });
        updateArgs({
          overridesOld: overrides || overridesOld
        });
      } else if (context.args.overridesOld) {
        delete context.args.overrides;
        updateArgs(args);
      }
    }

    console.log(args);
    setTimeout(function () {
      tippy('[data-tippy-content]');
    }, 0);
  }, [outlineActive]);
  return StoryFn();
};