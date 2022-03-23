/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

import "./namespace-select.scss";

import React, { useEffect, useState } from "react";
import { computed } from "mobx";
import { observer } from "mobx-react";
import { Select, SelectProps } from "../select";
import { cssNames } from "../../utils";
import { Icon } from "../icon";
import type { NamespaceStore } from "./namespace-store/namespace.store";
import { withInjectables } from "@ogre-tools/injectable-react";
import namespaceStoreInjectable from "./namespace-store/namespace-store.injectable";

export const selectAllNamespaces = Symbol("all-namespaces-selected");

export type NamespaceSelectSort = (left: string, right: string) => number;

export type NamespaceSelectProps<ShowAllNamespaces extends boolean = false> = (
  SelectProps<
    ShowAllNamespaces extends true
      ? string | typeof selectAllNamespaces
      : string,
    false
  >
  & {
    showIcons?: boolean;
    sort?: NamespaceSelectSort;
  }
  & (
    ShowAllNamespaces extends true
      ? {
        showAllNamespacesOption: true;
      }
      : {
        showAllNamespacesOption?: false;
      }
  )
);

interface Dependencies {
  namespaceStore: NamespaceStore;
}

function getOptions(namespaceStore: NamespaceStore, showAllNamespacesOption: boolean, sort: NamespaceSelectSort | undefined) {
  return computed(() => {
    const baseOptions = namespaceStore.items
      .map(ns => ns.getName())
      .filter(ns => ns.length > 0);

    if (sort) {
      baseOptions.sort(sort);
    }

    if (showAllNamespacesOption) {
      return [selectAllNamespaces, ...baseOptions] as const;
    }

    return baseOptions;
  });
}

const NonInjectedNamespaceSelect = observer(({
  namespaceStore,
  showIcons,
  formatOptionLabel = (data) => {
    if (data === selectAllNamespaces) {
      return "All Namespaces";
    }

    if (!showIcons) {
      return data;
    }

    return (
      <>
        <Icon small material="layers"/>
        {data}
      </>
    );
  },
  sort,
  showAllNamespacesOption = false,
  className,
  ...selectProps
}: Dependencies & NamespaceSelectProps<boolean>) => {
  const [options, setOptions] = useState(getOptions(namespaceStore, showAllNamespacesOption, sort));

  useEffect(() => {
    setOptions(getOptions(namespaceStore, showAllNamespacesOption, sort));
  }, [sort, showAllNamespacesOption]);

  return (
    <Select
      className={cssNames("NamespaceSelect", className)}
      menuClass="NamespaceSelectMenu"
      formatOptionLabel={formatOptionLabel}
      options={options.get()}
      {...selectProps}
    />
  );
});

const InjectedNamespaceSelect = withInjectables<Dependencies, NamespaceSelectProps<boolean>>(NonInjectedNamespaceSelect, {
  getProps: (di, props) => ({
    ...props,
    namespaceStore: di.inject(namespaceStoreInjectable),
  }),
});

export function NamespaceSelect<ShowAllNamespaces extends boolean = false>(props: NamespaceSelectProps<ShowAllNamespaces>) {
  return <InjectedNamespaceSelect {...(props as NamespaceSelectProps<boolean>)} />;
}
