/**
 * Copyright (c) OpenLens Authors. All rights reserved.
 * Licensed under MIT License. See LICENSE in root directory for more information.
 */

/**
 * This type helps define which fields of some type will always be defined
 */
export type Defaulted<Params, DefaultParams extends keyof Params> = Required<Pick<Params, DefaultParams>> & Omit<Params, DefaultParams>;

export type OptionVarient<Key, Base, RequiredKey extends keyof Base> = {
  type: Key;
} & Pick<Base, RequiredKey> & {
  [OtherKey in Exclude<keyof Base, RequiredKey>]?: undefined;
};
