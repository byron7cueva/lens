/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

export type Disposer = () => void;

interface Extendable {
  push(...vals: (Disposer | { dispose: Disposer })[]): void;
}

export type ExtendableDisposer = Disposer & Extendable;

export function disposer(...args: Disposer[]): ExtendableDisposer {
  const res = () => {
    args.forEach(dispose => dispose?.());
    args.length = 0;
  };

  res.push = (...vals: (Disposer | { dispose: Disposer })[]) => {
    for (const val of vals) {
      if (typeof val === "function") {
        args.push(val);
      } else {
        args.push(() => val.dispose());
      }
    }
  };

  return res;
}
