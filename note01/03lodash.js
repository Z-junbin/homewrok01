//loadsh演示
// first、last、toUpper、reverse、each、include、find、findIndex

const _ = require('lodash')
const array = ["zheng", "jun", "bin"]
console.log(_.first(array));
console.log(_.last(array));
console.log(_.toUpper(_.first(array)));
let r = _.each(array, (item, index) => {
  console.log(item,index);
})
console.log("444",r);
console.log(_.reverse(array));