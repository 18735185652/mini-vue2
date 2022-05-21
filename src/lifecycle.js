import { createElementVNode, createTextVNode } from './vdom'
import Watcher from './observe/watcher'
function createElm(vnode) {
  let { tag, data, children, text } = vnode;
  if (typeof tag === 'string') { // 标签
    vnode.el = document.createElement(tag) // 这里将真实节点和虚拟节点对应起来，如果修改属性了

    patchProps(vnode.el, data)
    children.forEach(child => {
      vnode.el.appendChild(createElm(child))
    })
  } else {
    vnode.el = document.createTextNode(text)
  }
  return vnode.el
}
function patchProps(el, props) {
  for (let key in props) {
    if (key === 'style') {
      for (let styleName in props.style) {
        el.style[styleName] = props.style[styleName]
      }
    } else {
      el.setAttribute(key, props[key])
    }

  }
}
function patch(oldVNode, vnode) {
  // 写的是初渲染流程
  const isRealElement = oldVNode.nodeType;
  if (isRealElement) {
    let elm = oldVNode;
    const parentElm = elm.parentNode; //拿到父元素
    let newElm = createElm(vnode);
    parentElm.insertBefore(newElm, elm.nextSibling)
    parentElm.removeChild(elm) // 删除老节点
    return newElm

  } else {

  }
}

export function initLifeCycle(Vue) {
  Vue.prototype._update = function (vnode) {
    // patch既有初始化的功能 又有更新的功能
    const vm = this;
    const el = vm.$el;
    vm.$el = patch(el, vnode)
  }
  Vue.prototype._c = function () {
    return createElementVNode(this, ...arguments)
  }
  Vue.prototype._v = function () {
    return createTextVNode(this, ...arguments)

  }
  Vue.prototype._s = function (value) {
    if (value !== 'object') return value
    return JSON.stringify(value)
  }
  Vue.prototype._render = function () {
    // 让with中的this指向vm
    return this.$options.render.call(this)
  }
}


export function mountComponent(vm, el) {
  vm.$el = el; // 这里的el 是通过querySelector获取过的
  // 1. 调用render方法产生虚拟节点 虚拟dom
  const updateComponent = () => {
    vm._update(vm._render()); // vm.$options.render() 虚拟节点
  }
  // debugger;
  let watcher = new Watcher(vm, updateComponent, true) // true用于标识一个渲染watcher

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


// 调用钩子函数
export function callHook(vm,hook){
  const headers = vm.$options[hook];
  if(headers){
    headers.forEach(handler=>handler.call(vm))
  }
}
