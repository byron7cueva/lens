/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * A better typed version of `Object.fromEntries` where the keys are known to
 * be a specific subset
 */
export function fromEntries<T, Key extends string>(entries: Iterable<readonly [Key, T]>): Record<Key, T> {
  return Object.fromEntries(entries) as { [k in Key]: T };
}

export function entries<T extends Record<string, any>>(obj: T | null | undefined): [keyof T, T[keyof T]][] {
  if (!obj) {
    return [];
  }

  return Object.entries(obj);
}
