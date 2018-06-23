/* globals describe: false, it: false */
import chai from 'chai'
import { guard, typeOf, oneOfType, shapeOf, instanceOf, optional, arrayOf, oneOf, any } from './'
const { expect } = chai

describe('function-guard', () => {
  describe('typeOf', () => {
    it('has a useful name', () => {
      expect(typeOf('string')).to.have.property('name', 'a string')
      expect(typeOf('number')).to.have.property('name', 'a number')
      expect(typeOf('Foo')).to.have.property('name', 'a Foo')
    })

    it('returns true for types that match', () => {
      expect(typeOf('string')('foo')).to.equal(true)
    })

    it('returns a message for types that dont match', () => {
      expect(typeOf('string')(1)).to.equal("is not a string (it's a number)")
      expect(typeOf('string')({})).to.equal("is not a string (it's an Object)")
      expect(typeOf('string')(undefined)).to.equal("is not a string (it's undefined)")
      expect(typeOf('string')(null)).to.equal("is not a string (it's null)")
    })
  })

  describe('oneOf', () => {
    it('has a useful name', () => {
      expect(oneOf(1, 2, 3)).to.have.property('name', 'one of the following values: 1, 2, 3')
      expect(oneOf('a', 'b', 'c')).to.have.property('name', 'one of the following values: a, b, c')
    })

    it('returns true for types that match', () => {
      expect(oneOf(1, 2, 3)(1)).to.equal(true)
      expect(oneOf(1, 2, 3)(2)).to.equal(true)
      expect(oneOf(1, 2, 3)(3)).to.equal(true)
    })

    it('returns a message for types that dont match', () => {
      expect(oneOf(1, 2, 3)(4)).to.equal("is not one of 1, 2, 3 (it's 4)")
    })
  })

  describe('oneOfType', () => {
    it('has a useful name', () => {
      expect(oneOfType(typeOf('string'), typeOf('number'))).to.have.property(
        'name',
        'one of the following: a string, or a number'
      )
      expect(oneOfType(typeOf('function'), oneOf(1, 2))).to.have.property(
        'name',
        'one of the following: a function, or one of the following values: 1, 2'
      )
    })

    it('returns true for types that match', () => {
      expect(oneOfType(typeOf('string'), typeOf('number'))('hello')).to.equal(true)
      expect(oneOfType(typeOf('string'), typeOf('number'))(1)).to.equal(true)
    })

    it('returns a message for types that dont match', () => {
      expect(oneOfType(typeOf('string'), typeOf('number'))(false)).to.equal(
        "failed all of these checks: is not a string (it's a boolean), is not a number (it's a boolean)"
      )
    })

    it('returns useful message for guards that dont return messages', () => {
      const crappyGuard = () => false
      expect(oneOfType(crappyGuard)(false)).to.match(/failed all of these checks:/)
    })
  })

  describe('optional', () => {
    it('has a useful name', () => {
      expect(optional('string')).to.have.property('name', 'optionally a string')
      expect(optional('number')).to.have.property('name', 'optionally a number')
      expect(optional(any())).to.have.property('name', 'optionally any value')
      expect(optional(oneOf(1, 2, 3))).to.have.property('name', 'optionally one of the following values: 1, 2, 3')
    })

    it('returns true for types that match the given guard', () => {
      expect(optional(oneOf(1, 2, 3))(1)).to.equal(true)
      expect(optional(oneOf(1, 2, 3))(2)).to.equal(true)
      expect(optional(oneOf(1, 2, 3))(3)).to.equal(true)
    })

    it('returns true for undefined', () => {
      expect(optional(oneOf(1, 2, 3))(undefined)).to.equal(true)
    })

    it('returns the underlying message for types that dont match', () => {
      expect(optional(oneOf(1, 2, 3))(4)).to.equal("is not one of 1, 2, 3 (it's 4)")
    })
  })

  describe('arrayOf', () => {
    it('has a useful name', () => {
      expect(arrayOf('string')).to.have.property('name', 'an array where each element is a string')
      expect(arrayOf(oneOf('a', 'b', 'c'))).to.have.property(
        'name',
        'an array where each element is one of the following values: a, b, c'
      )
    })

    it('returns true for types that match', () => {
      expect(arrayOf('string')(['a', 'b', 'c'])).to.equal(true)
    })

    it('returns a message for types that dont match')
  })

  describe('any', () => {
    it('has a useful name', () => {
      expect(any()).to.have.property('name', 'any value')
    })

    it('always returns true', () => {
      expect(any()()).to.equal(true)
      expect(any()('foobar')).to.equal(true)
    })
  })

  describe('shapeOf', () => {
    it('has a useful name', () => {
      expect(shapeOf({ x: typeOf('number'), y: typeOf('number') })).to.have.property(
        'name',
        'the shape of { x: a number, y: a number }'
      )
    })

    it('returns true for types that match', () => {
      expect(shapeOf({ x: typeOf('number'), y: typeOf('number') })({ x: 1, y: 2 })).to.equal(true)
      expect(shapeOf({ prop: typeOf('string') })({ prop: 'y' })).to.equal(true)
    })

    it('returns a message for types that dont match', () => {
      expect(shapeOf({ x: typeOf('number'), y: typeOf('number') })({ x: 1 })).to.equal('did not have property y')
      expect(shapeOf({ x: typeOf('number'), y: typeOf('number') })({ x: 1, y: '2' })).to.equal(
        "property y is not a number (it's a string)"
      )
      expect(shapeOf({ prop: typeOf('string') })({})).to.equal('did not have property prop')
      expect(shapeOf({ prop: typeOf('string') })({ prop: false })).to.equal(
        "property prop is not a string (it's a boolean)"
      )
    })
  })

  describe('instanceOf', () => {
    function Foo() {}

    it('has a useful name', () => {
      expect(instanceOf(Foo))
        .to.have.property('name')
        .match(/instanceof (Foo|function Foo\(\) \{\})/)
    })

    it('still has a useful name even if given class does not', () => {
      class CrappyClass {}
      Object.defineProperty(CrappyClass, 'name', { value: undefined })
      expect(instanceOf(CrappyClass))
        .to.have.property('name')
        .match(/instanceof (:?.*)/)
    })

    it('returns true for types that match', () => {
      expect(instanceOf(Foo)(new Foo())).to.equal(true)
    })

    it('returns a message for types that dont match')
  })

  describe('guard', () => {
    it('wraps a function in a set of guards', () => {
      const add = guard(typeOf('number'), typeOf('number'), (left, right) => left + right)
      Object.defineProperty(add, 'foo', { value: 1 })
      expect(add).to.have.property('foo', 1)
      // Wrap in an if because IE11 doesnt support configuring length ¯\_(ツ)_/¯
      if (Object.getOwnPropertyDescriptor(add, 'length').configurable) {
        expect(add)
          .to.be.a('function')
          .with.lengthOf(2)
      }
    })

    it('calls the underlying logic when guards match', () => {
      const add = guard(typeOf('number'), typeOf('number'), (left, right) => left + right)
      expect(add(3, 7)).to.equal(10)
    })

    it('throws errors when the given guards dont match', () => {
      const add = guard(typeOf('number'), typeOf('number'), (left, right) => left + right)
      expect(() => add('foo', 7)).to.throw(TypeError, /Argument 1 given to (function|wrapped)/)
    })

    it('adds a @@guards key', () => {
      const add = guard(typeOf('number'), typeOf('number'), (left, right) => left + right)
      expect(add)
        .to.have.property('@@guards')
        .with.lengthOf(2)
      expect(add['@@guards'][0]).to.have.property('name', 'a number')
      expect(add['@@guards'][1]).to.have.property('name', 'a number')
    })

    it('normalises string arguments to be `typeOf` guards', () => {
      const add = guard('number', 'number', (left, right) => left + right)
      expect(add['@@guards'][0]).to.have.property('name', 'a number')
      expect(add['@@guards'][1]).to.have.property('name', 'a number')
    })

    it('normalises Array arguments to be `oneOfType` guards', () => {
      const add = guard(
        [typeOf('number'), typeOf('string')],
        [typeOf('number'), typeOf('string')],
        (left, right) => left + right
      )
      expect(add['@@guards'][0]).to.have.property('name', 'one of the following: a number, or a string')
      expect(add['@@guards'][1]).to.have.property('name', 'one of the following: a number, or a string')
    })

    it('normalises Plain Object arguments to be `shapeOf` guards', () => {
      const add = guard({ x: typeOf('number'), y: typeOf('number') }, ({ x, y }) => x + y)
      expect(add['@@guards'][0]).to.have.property('name', 'the shape of { x: a number, y: a number }')
    })

    it('throws an error for non-guard values', () => {
      expect(() => guard(1, ({ x, y }) => x + y)).to.throw(TypeError, 'Cannot normalize 1')
    })

    it('provides a useful error for guards that return false and have no name', () => {
      const crappyGuard = () => false
      Object.defineProperty(crappyGuard, 'name', { value: undefined })
      const identity = value => value
      expect(() => guard(crappyGuard, identity)(1, 2)).to.throw(TypeError, /Argument 1 given to/)
    })
  })
})
