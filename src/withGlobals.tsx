import type { DecoratorFunction } from "@storybook/addons";
import { useEffect, useGlobals, useArgs, useChannel } from "@storybook/addons";
import tippy from "tippy.js";
import 'tippy.js/dist/tippy.css';
import {linkTo} from "@storybook/addon-links";
import React from "react";
// @ts-ignore
import styled from '@emotion/styled';

const ComponentWrapper = styled.div({
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
    border: '1px solid transparent',
  },
  '&:hover:before': {
    background: 'rgba(0,114,171,0.37)',
    border: '1px solid #000',
  },
});

const ComponentPreviewWrapper = (children: any, componentName: string, widgetStorybookName: string) => {
  const isComponentWrapper = componentName.includes('Wrapper');
  const hasPreviewAlready = children.key?.includes('preview-wrapper');

  if(hasPreviewAlready) {
    return children;
  }

  return <ComponentWrapper
              key={`preview-wrapper-${componentName}`}
              data-tippy-content={componentName}
              data-tippy-placement={isComponentWrapper ? 'left' : 'top-start'}
              onClick={(e: any) => {
                 e.stopPropagation();
                 linkTo(`${widgetStorybookName}/${componentName}`)();
              }}
          >
              {children}
          </ComponentWrapper>;
};

const wrapComponentsWithPreviewWrapper = (componentDeps: any, widgetLocation: string) => {
  const wrappedDeps = {} as any;
  console.log(componentDeps);
  Object.keys(componentDeps).forEach((componentName: string) => {
    wrappedDeps[componentName] = (props: any) =>{
      const children = typeof componentDeps[componentName] === 'function' ? componentDeps[componentName](props) : componentDeps[componentName].render(props);
      console.log(componentDeps[componentName]);
      return ComponentPreviewWrapper(children, componentName, widgetLocation);
    }
  });

  return wrappedDeps;
};

export const withGlobals: DecoratorFunction = (StoryFn, context) => {
  const [{ outlineActive }] = useGlobals();
  const [args, updateArgs] = useArgs();

  const widgetLocation = () => {
    const index = context.kind.lastIndexOf("/");
      return context.kind.substring(0, index);
  }

  useEffect(() => {
    // Execute your side effect here
    // For example, to manipulate the contents of the preview
      const overrides = context.args.overrides;
      const overridesOld = context.args.overridesOld;

      // these updates are little hacky, but it works. Everything else I tried produces infinite loop. Didn't spend too much time on it.
      if(overrides || overridesOld) {
        if(outlineActive) {
          updateArgs({ overrides: wrapComponentsWithPreviewWrapper(overrides || overridesOld, widgetLocation())});
          updateArgs({ overridesOld: overrides || overridesOld});
        } else if (context.args.overridesOld) {
          delete context.args.overrides;
          updateArgs(args);
        }
      }

    setTimeout(() => {
      tippy('[data-tippy-content]');
    }, 0);
  }, [outlineActive]);

  return StoryFn();
};
