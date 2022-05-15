import { parseHTML } from './parse'

// 对模版进行编译处理 vue3采用的不是使用正则
export function compileToFunction(template) {
  // 1. 将template转换成ast语法树
  // 2. 生成render方法(render方法执行后返回的结果就是 虚拟DOM)
  // console.log('template1111: ', template);

  let ast = parseHTML(template)
  console.log('ast: ', ast);
}
