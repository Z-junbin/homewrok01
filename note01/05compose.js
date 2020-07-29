// 函数组合（默认从右到左执行的）
const _ = require('lodash')
// lodash中提供了两个组合函数的方法 1.flow()左到右    2.flowRight() 右到左

// 模拟
function compose(f, g) {
  return function (value) {
    return f(g(value))
  }
}


function reverse(array) {
  return array.reverse()
}
function first(array) {
  return array[0]
}
function toUpper(array) {
  return array.toUpperCase()
}
const last = compose(first,reverse)
let value = last([1, 5, 6, 9, 7])
console.log(value);
const f = _.flowRight(toUpper, first, reverse)
console.log(f(['f', 'g', 'y', 'j', 'o']));

// flowRight()原理
function compose(...args) {
  return function (value) {
    return args.reverse().reduce(function (acc, fn) {
      return fn(acc)
    },value)
  }
}
// 结合律
const jiehelv = _.flowRight(_.flowRight(_.toUpper, _.first), _.reverse)
console.log(jiehelv(['f', 'g', 'y', 'j', 'o']));

// 调试


