export function initLifeCycle(Vue) {
  Vue.prototype._update = function () {
    console.log('_update')
  }
  Vue.prototype._render = function () {
    console.log('_render')
  }
}


export function mountComponent(vm, el) {
  // 1. 调用render方法产生虚拟节点 虚拟dom
  vm._update(vm._render()); // vm.$options.render() 虚拟节点

  // 2. 根据虚拟dom产生真实dom


  // 3. 插入到el元素中
}


// vue的核心流程
// 1。 创造了响应式数据
// 2. 模版转换成ast语法树
// 3. 将ast转换成了render函数，产生虚拟节点
// 4. 后续每次数据更新可以只执行render函数 无需再次执行ast转换的过程
// 5. render函数会去产生虚拟节点（使用响应式数据）
// 6. 根据生成的虚拟节点创造真实的DOM
