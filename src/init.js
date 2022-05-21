
import { initState } from './state'
import { compileToFunction } from './compiler'
import { mountComponent, callHook } from './lifecycle'
import { mergeOptions } from './utils'

export function initMixin(Vue) { // 就是给Vue增加init方法
  Vue.prototype._init = function (options) { // 用于初始化操作
    // vue vm.$options 就是获取用户的配置
    const vm = this;
    vm.$options = mergeOptions(this.constructor.options, options); // 将用户的选项挂在到实例上
    callHook(vm, 'beforeCreate')

    //初始化状态
    initState(vm);
    callHook(vm, 'created')
    if (options.el) {
      vm.$mount(options.el)
    }
  }
  Vue.prototype.$mount = function (el) {
    const vm = this;
    el = document.querySelector(el);
    let opts = vm.$options;
    if (!opts.render) { // 先查找有没有render函数
      let template;
      if (!opts.template && el) { // 没写模版 但写了el
        template = el.outerHTML;
      } else {
        if (el) template = opts.template // 如果有el 则采用模版的内容
      }
      // 写了tamplate 就用写了的template
      if (template) {
        // 这里需要对模版进行编译
        const render = compileToFunction(template)
        opts.render = render
      }
    }
    mountComponent(vm, el) // 组件的挂载

    // opts.render; // 最终就可以获取render方法
  }
}


