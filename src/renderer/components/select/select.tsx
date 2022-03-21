/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

// Wrapper for "react-select" component
// API docs: https://react-select.com/
import "./select.scss";

import React from "react";
import { computed, makeObservable } from "mobx";
import { observer } from "mobx-react";
import ReactSelect, { components, GroupBase } from "react-select";
import type { Props as ReactSelectProps } from "react-select";
import { ThemeStore } from "../../theme.store";
import { boundMethod, cssNames } from "../../utils";

const { Menu } = components;

export interface SelectOption<T> {
  value: T;
  label?: React.ReactElement | string;
}

export interface SelectProps<Option, IsMulti extends boolean, Group extends GroupBase<Option> = GroupBase<Option>> extends ReactSelectProps<Option, IsMulti, Group> {
  themeName?: "dark" | "light" | "outlined" | "lens";
  menuClass?: string;
}

export function convertToSelectOptions(src: string[]): SelectOption<string>[] {
  return src.map(value => ({
    value,
    label: value,
  }));
}

@observer
export class Select<Option, IsMulti extends boolean = false, Group extends GroupBase<Option> = GroupBase<Option>> extends React.Component<SelectProps<Option, IsMulti, Group>> {
  static defaultProps = {
    menuPortalTarget: document.body,
    menuPlacement: "auto",
  };

  constructor(props: SelectProps<Option, IsMulti, Group>) {
    super(props);
    makeObservable(this);
  }

  @computed get themeClass() {
    const themeName = this.props.themeName || ThemeStore.getInstance().activeTheme.type;

    return `theme-${themeName}`;
  }

  @boundMethod
  onKeyDown(evt: React.KeyboardEvent<HTMLDivElement>) {
    this.props.onKeyDown?.(evt);

    if (evt.nativeEvent.code === "Escape") {
      evt.stopPropagation(); // don't close the <Dialog/>
    }
  }

  render() {
    const {
      className, menuClass, components = {}, ...props
    } = this.props;
    const WrappedMenu = components.Menu ?? Menu;

    return <ReactSelect
      {...props}
      styles={{
        menuPortal: styles => ({
          ...styles,
          zIndex: "auto",
        }),
      }}
      onKeyDown={this.onKeyDown}
      className={cssNames("Select", this.themeClass, className)}
      classNamePrefix="Select"
      components={{
        ...components,
        Menu: props => (
          <WrappedMenu
            {...props}
            className={cssNames(menuClass, this.themeClass, props.className)}
          />
        ),
      }}
    />;
  }
}
