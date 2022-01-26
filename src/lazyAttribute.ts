import type { FactorizedAttr, LazyAttributeCallback } from './types'

export class LazyAttribute<T, V> {
  constructor(private callback: LazyAttributeCallback<T, V>) {}

  resolve(entity: T): FactorizedAttr<V> {
    return this.callback(entity)
  }
}
