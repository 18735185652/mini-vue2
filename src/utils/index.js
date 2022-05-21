const strats = {};
const LIFECYCLE = [
  'beforeCreate',
  'created'
]
LIFECYCLE.forEach(hook => {
  strats[hook] = function (p, c) {
    if (c) { // 如果儿子有 父亲有 让父亲和儿子拼接在一起
      if (p) {  //
        return p.concat(c)
      } else {
        return [c]; //儿子有 父亲没有，则将儿子包装成数组
      }
    } else {
      return p; // 儿子没有 用父亲即可
    }
  }
})



export function mergeOptions(parent, child) {
  const options = {};
  for (let key in parent) { // 循环老的
    mergeField(key)
  }
  for (let key in child) { // 循环老的
    if (!parent.hasOwnProperty(key)) {
      mergeField(key)
    }
  }


  function mergeField(key) {
    if (strats[key]) {
      options[key] = strats[key](parent[key], child[key])
    } else {
      // 如果不在策略中则以儿子为主
      options[key] = child[key] || parent[key];

    }
  }
  return options;
}
