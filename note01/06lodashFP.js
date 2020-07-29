// fp模块  函数优先 数据之后
const fp = require('lodash/fp')
const _ = require('lodash')
const f = fp.flowRight(fp.join('-'),fp.map(fp.toLower),fp.split(' '))
console.log(f("NEVER SAY NEVER"));

//lodash数据优先 函数之后
console.log(_.map(['23','24','30'],parseInt));
console.log(fp.map(parseInt, ['23', '24', '30']));

// Piont Free
const ff = fp.flowRight(fp.replace(/\s+/g, '_'), fp.toLower)
console.log(ff('hhh   llll'));
// 案例
// const firstLittleToUppre = fp.flowRight(fp.join('. '),fp.map(fp.first),fp.map(fp.toUpper),fp.split(' '))
const firstLittleToUppre = fp.flowRight(fp.join('. '),fp.map(fp.flowRight(fp.toUpper,fp.first)),fp.split(' '))
console.log(firstLittleToUppre('wefef fdsf fse'));