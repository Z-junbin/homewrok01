// 柯里化
const _ = require('lodash')

// 普通纯函数
function checkAge1(min, age) {
  return age >= min;
}

//柯里化函数
function checkAge2(min) {
  return function (age) {
    return age >= min;
  }
}
// let checkAge = min => (age => age >= min)

// lodash中curry的使用
function getSum(a, b, c) {
  return a + b + c  
}
const curried=_.curry(getSum)

console.log(curried(2)(2)(3))
console.log(curried(2,2)(3))
console.log(curried(2,3,5))


// 柯里化案例
let match = _.curry(function match(reg, str) {
  return str.match(reg)
})
const haveSpace = match(/\s+/g)
const haveNum = match(/\d+/g)
console.log(haveSpace('ff  ffa'));
console.log(haveNum('ffd55ffa'));

const filter = _.curry(function (func, array) {
  return array.filter(func)
})

console.log(filter(haveSpace,["fff ","ffff"]));
console.log(filter(haveSpace)(["fff ", "ffff"]));


// 模拟curry函数
function curry(func) {
  return function curryFn(...args) {
    // 判断实参、形参的个数
    if (args.length < func.length) {
      return function () {
        return curryFn(...args.concat(Array.from(arguments)))
      }
    }
    return func(...args)
  }
}
const curryA = curry(getSum)
console.log("ccccc",curryA(2,6,8));
console.log("ccccc",curryA(2,2)(8));