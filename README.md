# function-guard

Function guard is a quick and dirty way to create runtime type checks against your functions.

If you're familiar with React's PropTypes, function-guard is basically that but for function arguments.


### Usage

```js
import {guard } from 'function-guard'

const add = guard('number', 'number', (a, b) => a + b)
add(1, 1) === 2

add('a', 'b') // TypeError: Argument 1 given to add is not a number (it's a string)
```

Guard has many included higher-order-functions which allow you to create different types of guards:


#### typeOf

Uses [type-detect](https://npm.im/type-detect) under the hood, to get the [Symbol.toStringTag] branding of a type:

```js
import {guard, typeOf} from 'function-guard'
const addOne = guard(typeOf('number'), a => a += 1)
```
#### shapeOf

Traverses the properties of a given object and runs the guards on them

```js
import {guard, typeOf, shapeOf} from 'function-guard'
const sumPoint = guard(shapeOf({ x: typeOf('number'), y: typeOf('number') }), ({ x, y }) => x + y)
```

#### arrayOf

Traverses the values of a given array and runs the guards on them

```js
import {guard, typeOf, arrayOf} from 'function-guard'
const sumArray = guard(arrayOf(typeOf('number')), nums => nums.reduce((acc, cur) => acc + cur, 0))
```
#### oneOf

Expects the given value to be one of exactly these values (i.e. an enum check)

```js
import {guard, oneOf} from 'function-guard'
const actions = {
  create: Symbol('create'),
  read: Symbol('read'),
  update: Symbol('update'),
  delete: Symbol('delete'),
}
const doAction = guard(oneOf(Object.values(actions)),  value => value[action]())
```
#### oneOfType

Detemines the value is one of any of the given guards

```js
import {guard, typeOf, oneOfType} from 'function-guard'
const numberOrStringGuard = oneOfType(typeOf('string'), typeOf('number'))
const addNumberOrConcatStrings = guard(numberOrStringGuard, numberOrStringGuard, (a, b) => a + b)
```

#### instanceOf

Expects value to pass `instanceof` check

```js
import {guard, instanceOf} from 'function-guard'
class Foo {}
const cloneFoo = guard(instanceOf(Foo), foo => Object.create(Foo.prototype, Object.getOwnPropertyDescriptors(foo)))
```

#### optional

Takes a guard and passes it if the given value is undefined

```js
import {guard, typeOf, optional} from 'function-guard'

const guardedParseInt = guard(typeOf('string'), optional(typeOf('number')), parseInt)
```
#### any 

A function that always passes

```js
import {guard, typeOf, any} from 'function-guard'

const addToNumber = guard(typeOf('number'), any(), (num, whateverThisIs) => num + whateverThisIs)
```
