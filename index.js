import type from 'type-detect'

const ownPropNames = Object.getOwnPropertyNames
const ownSymbols = Object.getOwnPropertySymbols || (() => [])
const define = Object.defineProperty

const makeGuard = (guard, nameGetter) => define(guard, 'name', { get: nameGetter })

const stringify = guard => guard.name || guard.toString()

const startsWithVowel = /^[aeiou]/i
const prefixTag = tag => {
  if (tag === 'undefined' || tag === 'null') {
    return tag
  }
  return `${startsWithVowel.test(tag) ? 'an' : 'a'} ${tag}`
}

export const typeOf = guard =>
  makeGuard(value => {
    const valueType = type(value)
    return valueType === guard || `is not a ${guard} (it's ${prefixTag(valueType)})`
  }, () => `a ${guard}`)

export const shapeOf = guard =>
  makeGuard(
    value => {
      for (const key in guard) {
        if (!(key in value)) {
          return `did not have property ${key}`
        }
        const check = guard[key](value[key])
        if (check !== true) {
          return `property ${key} ${check}`
        }
      }
      return true
    },
    () => {
      const propNames = []
      for (const key in guard) {
        propNames.push(`${key}: ${stringify(guard[key])}`)
      }
      return `the shape of { ${propNames.join(', ')} }`
    }
  )

export const oneOfType = (...guards) => {
  guards = guards.map(normalize)
  return makeGuard(value => {
    const messages = []
    for (let i = 0; i < guards.length; i += 1) {
      const check = guards[i](value)
      if (check === true) {
        return true
      }
      messages.push(check || stringify(guards[i]))
    }
    return `failed all of these checks: ${messages.join(', ')}`
  }, () => `one of the following: ${guards.map(stringify).join(', or ')}`)
}

export const instanceOf = guard => makeGuard(value => value instanceof guard, () => `instanceof ${guard.name || guard}`)

export const oneOf = (...values) =>
  makeGuard(
    value => values.some(oneOfValue => value === oneOfValue) || `is not one of ${values.join(', ')} (it's ${value})`,
    () => `one of the following values: ${values.join(', ')}`
  )

export const any = () => makeGuard(() => true, () => 'any value')
export const optional = guard => {
  guard = normalize(guard)
  return makeGuard(value => value === undefined || guard(value), () => `optionally ${stringify(guard)}`)
}

export const arrayOf = guard => {
  guard = normalize(guard)
  return makeGuard(
    value => Array.isArray(value) && Array.prototype.every.call(value, guard),
    () => `an array where each element is ${stringify(guard)}`
  )
}

function normalize(guard) {
  if (typeof guard === 'function') {
    return guard
  }
  if (typeof guard === 'string') {
    return typeOf(guard)
  }
  if (Object(guard) === guard) {
    const proto = Object.getPrototypeOf(guard)
    if (proto === Object.prototype || proto === null) {
      return shapeOf(guard)
    }
    if (Array.isArray(guard)) {
      return oneOfType(...guard)
    }
  }
  throw new TypeError(`Cannot normalize ${guard}`)
}

export const guard = (...guards) => {
  const logic = guards.pop()
  guards = guards.map(normalize)
  const wrapped = (...args) => {
    const { length } = guards
    for (let i = 0; i < length; i += 1) {
      const currentGuard = guards[i]
      const value = args[i]
      const check = currentGuard(value)
      if (check !== true) {
        throw new TypeError(
          `Argument ${i + 1} given to ${wrapped.name || logic} ${
            check || currentGuard.name ? `is not ${currentGuard.name}` : `did not satisfy ${currentGuard}`
          }`
        )
      }
    }
    return logic(...args)
  }
  ownPropNames(logic)
    .concat(ownSymbols(logic))
    .forEach(prop => {
      const descriptor = Object.getOwnPropertyDescriptor(logic, prop)
      if (descriptor.configurable) {
        define(wrapped, prop, descriptor)
      }
    })
  define(wrapped, '@@guards', { value: guards })
  return wrapped
}
