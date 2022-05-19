(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
})(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
      return typeof obj;
    } : function (obj) {
      return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
    }, _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    Object.defineProperty(Constructor, "prototype", {
      writable: false
    });
    return Constructor;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArrayLimit(arr, i) {
    var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];

    if (_i == null) return;
    var _arr = [];
    var _n = true;
    var _d = false;

    var _s, _e;

    try {
      for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _unsupportedIterableToArray(o, minLen) {
    if (!o) return;
    if (typeof o === "string") return _arrayLikeToArray(o, minLen);
    var n = Object.prototype.toString.call(o).slice(8, -1);
    if (n === "Object" && o.constructor) n = o.constructor.name;
    if (n === "Map" || n === "Set") return Array.from(o);
    if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
  }

  function _arrayLikeToArray(arr, len) {
    if (len == null || len > arr.length) len = arr.length;

    for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];

    return arr2;
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
  }

  var oldArrayProto = Array.prototype; //获取数组的原型

  var newArrayProto = Object.create(oldArrayProto);
  var methods = [// 找到所有的变异方法
  "push", "pop", "shift", "unshift", "sort", "splice"];
  methods.forEach(function (method) {
    // arr.push(1,2,3)
    newArrayProto[method] = function () {
      var _oldArrayProto$method;

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      //这里重写了数组的方法
      // todo...
      var result = (_oldArrayProto$method = oldArrayProto[method]).call.apply(_oldArrayProto$method, [this].concat(args)); // 内部调用原来的方法


      var inserted;
      var ob = this.__ob__;

      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;

        case 'splice':
          inserted = args.slice(2);
          break;
      }

      if (inserted) {
        // 对新增的内容再次观测
        ob.ovserverArray(inserted);
      }

      return result;
    };
  });

  var id$1 = 0;

  var Dep = /*#__PURE__*/function () {
    function Dep() {
      _classCallCheck(this, Dep);

      this.id = id$1++; //属性的dep要收集watcher

      this.subs = []; // 这里存放着当前属性对应的watcher有哪些
    }

    _createClass(Dep, [{
      key: "depend",
      value: function depend() {
        // 这里不需要放重复的watcher 而且
        // this.subs.push(Dep.target)
        Dep.target.addDep(this); // 让watcher记住dep
      }
    }, {
      key: "addSub",
      value: function addSub(watcher) {
        this.subs.push(watcher);
      }
    }, {
      key: "notify",
      value: function notify() {
        this.subs.forEach(function (watcher) {
          return watcher.update();
        });
      }
    }]);

    return Dep;
  }();

  Dep.target = null;

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      // Object.defineProperty 只能劫持已经存在的属性（vue里面会为此单独写一些api $set $delete）
      Object.defineProperty(data, '__ob__', {
        value: this,
        enumerable: false // 将__ob__变成了不可枚举（循环的时候无法获取到）

      });

      if (Array.isArray(data)) {
        // 这里我么可以重写数组中的方法， 7个变异方法 是可以修改数组本身的
        data.__proto__ = newArrayProto;
        this.ovserverArray(data); // 如果数组中放的是对象 可以监控到对象的变化
      } else {
        this.walk(data);
      }
    }

    _createClass(Observer, [{
      key: "walk",
      value: function walk(data) {
        // 循环对象对属性依次劫持
        Object.keys(data).forEach(function (key) {
          return defineReactive(data, key, data[key]);
        });
      }
    }, {
      key: "ovserverArray",
      value: function ovserverArray(data) {
        // 观测数组
        data.forEach(function (item) {
          return observe(item);
        });
      }
    }]);

    return Observer;
  }();

  function defineReactive(target, key, value) {
    observe(value); // 对所有的对象都进行属性劫持

    var dep = new Dep(); // 每个属性都有一个dep

    Object.defineProperty(target, key, {
      get: function get() {
        console.log('用户取值了', key);

        if (Dep.target) {
          dep.depend(); // 让这个属性的收集器记住当前的watcher
        }

        return value;
      },
      set: function set(newValue) {
        // 修改的时候 会执行set
        if (value === newValue) return;
        observe(newValue); // 如果设置的值也是一个对象 也需要观测

        console.log('用户设置值了');
        value = newValue;
        dep.notify();
      }
    });
  }
  function observe(data) {
    // 对这个对象进行劫持
    if (_typeof(data) !== 'object' || data == null) {
      return;
    }

    if (data.__ob__ instanceof Observer) {
      return data.__ob__;
    } // 如果一个对象被劫持过了，那就不需要在被劫持了（要判断一个对象是否被劫持过，可以增添一个实例用实例来判断是否被劫持过）


    return new Observer(data);
  }

  function initState(vm) {
    var opts = vm.$options;

    if (opts.data) {
      initData(vm);
    }
  }

  function proxy(vm, target, key) {
    Object.defineProperty(vm, key, {
      get: function get() {
        return vm[target][key];
      },
      set: function set(newValue) {
        vm[target][key] = newValue;
      }
    });
  }

  function initData(vm) {
    var data = vm.$options.data;
    data = typeof data === 'function' ? data.call(vm) : data;
    vm._data = data; // 对数据进行劫持 vue2里采用了一个api defineProperty

    observe(data); // 将vm._data 用vm来代理就可以了

    for (var key in data) {
      proxy(vm, '_data', key);
    }
  }

  var ncname = "[a-zA-Z_][\\-\\.0-9_a-zA-Z]*";
  var qnameCapture = "((?:".concat(ncname, "\\:)?").concat(ncname, ")");
  var startTagOpen = new RegExp("^<".concat(qnameCapture)); // 标签开头的正则 捕获的内容是标签名

  var endTag = new RegExp("^<\\/".concat(qnameCapture, "[^>]*>")); // 匹配标签结尾的 </div>

  var attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/; // 匹配属性的 属性的第一个分组就是key value

  var startTagClose = /^\s*(\/?)>/; // 匹配标签结束的  <div> <br/>
  // const defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g // {{ asdsadsa }} 匹配到的内容是我们表达式的变量

  function parseHTML(html) {
    var ELEMENT_TYPE = 1;
    var TEXT_TYPE = 3;
    var stack = [];
    var currentParent; // 指向的是栈中的最后一个

    var root;

    function createASTElement(tag, attrs) {
      return {
        tag: tag,
        type: ELEMENT_TYPE,
        children: [],
        attrs: attrs,
        parent: null
      };
    }

    function start(tag, attrs) {
      var node = createASTElement(tag, attrs); // 创造一个ast节点

      if (!root) {
        // 看一下是否为空树
        root = node; // 如果为空则当前是树的根节点
      }

      if (currentParent) {
        node.parent = currentParent; // 只赋予了parent属性

        currentParent.children.push(node); // 还需要让父亲记住自己
      }

      stack.push(node);
      currentParent = node; // console.log('root', root)
    }

    function chars(text) {
      text = text.replace(/\s/g, '');

      if (text) {
        currentParent.children.push({
          type: TEXT_TYPE,
          text: text,
          parent: currentParent
        });
      }
    }

    function end(tag) {
      console.log('end: ', tag);
      stack.pop();
      currentParent = stack[stack.length - 1];
    }

    function advance(n) {
      html = html.substring(n);
    }

    function parseStartTag() {
      var start = html.match(startTagOpen);

      if (start) {
        var match = {
          tagName: start[1],
          // 标签名
          attrs: []
        };
        advance(start[0].length); // 如果不是开始标签的结束 就一直匹配下去

        var attr, _end;

        while (!(_end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          advance(attr[0].length);
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          });
        }

        if (_end) {
          advance(_end[0].length); // console.log('attr[0].length: ', attr[0].length);
        }

        return match;
      } // console.log(html)


      return false;
    }

    while (html) {
      // html最开始肯定是一个 <   <div>hello</div>
      // 如果textEnd 为0 说明是一个开始标签或者结束标签
      // 如果textEnd >0 说明就是文本的结束位置
      var textEnd = html.indexOf('<'); // 如果indexOf中的索引是0 则说明是个标签

      if (textEnd === 0) {
        var startTagMatch = parseStartTag();

        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        }

        var endTagMatch = html.match(endTag);

        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]);
          continue;
        }
      }

      if (textEnd > 0) {
        var text = html.substring(0, textEnd); // 文本内容

        if (text) {
          chars(text);
          advance(text.length);
        }
      }
    } // console.log('cc', html)


    return root;
  }

  var defaultTagRE = /\{\{((?:.|\r?\n)+?)\}\}/g; // {{ asdsadsa }} 匹配到的内容是我们表达式的变量

  function genProps(attrs) {
    var str = ''; // {name,value}

    for (var i = 0; i < attrs.length; i++) {
      var attr = attrs[i];

      if (attr.name === 'style') {
        (function () {
          // color:red => {color:'red'}
          var obj = {};
          attr.value.split(';').forEach(function (item) {
            var _item$split = item.split(':'),
                _item$split2 = _slicedToArray(_item$split, 2),
                key = _item$split2[0],
                value = _item$split2[1];

            obj[key] = value;
          });
          attr.value = obj;
        })();
      }

      str += "".concat(attr.name, ":").concat(JSON.stringify(attr.value), ",");
    }

    return "{".concat(str.slice(0, -1), "}");
  }

  function gen(node) {
    if (node.type === 1) {
      return codegen(node);
    } else {
      // 文本
      var text = node.text;

      if (!defaultTagRE.test(text)) {
        return "_v(".concat(JSON.stringify(text), ")");
      } else {
        // _c 元素 _s文本 _v 文本变量 {{name}}
        // _v(_s(name)+'hello'+_v(name))
        var tokens = [];
        var match;
        var lastIndex = 0;
        defaultTagRE.lastIndex = 0;

        while (match = defaultTagRE.exec(text)) {
          var index = match.index;

          if (index > lastIndex) {
            tokens.push(JSON.stringify(text.slice(lastIndex, index)));
          }

          tokens.push("_s(".concat(match[1].trim(), ")"));
          lastIndex = index + match[0].length;
        }

        if (lastIndex < text.length) {
          tokens.push(JSON.stringify(text.slice(lastIndex)));
        }

        return "_v(".concat(tokens.join('+'), ")");
      }
    }
  }

  function genChildren(children) {
    return children === null || children === void 0 ? void 0 : children.map(function (child) {
      return gen(child);
    }).join(',');
  }

  function codegen(ast) {
    var children = genChildren(ast.children);
    var code = "_c('".concat(ast.tag, "',").concat(ast.attrs.length > 0 ? genProps(ast.attrs) : "null").concat(ast.children.length ? ",".concat(children) : '', ")");
    return code;
  } // 对模版进行编译处理 vue3采用的不是使用正则


  function compileToFunction(template) {
    // 1. 将template转换成ast语法树
    var ast = parseHTML(template); // 2. 生成render方法(render方法执行后返回的结果就是 虚拟DOM)

    console.log('ast: ', ast); // 模版引擎的实现原理 就是 with + new Function

    var code = codegen(ast);
    code = "with(this){return ".concat(code, "}");
    var render = new Function(code);
    console.log('code: ', render.toString());
    return render;
  }

  // h() _c()
  function createElementVNode(vm, tag, data) {
    if (data == null) {
      data = {};
    }

    var key = data.key;

    if (key) {
      delete data.key;
    }

    for (var _len = arguments.length, children = new Array(_len > 3 ? _len - 3 : 0), _key = 3; _key < _len; _key++) {
      children[_key - 3] = arguments[_key];
    }

    return vnode(vm, tag, key, data, children);
  } // _v();

  function createTextVNode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  }

  function vnode(vm, tag, key, data, children, text) {
    return {
      vm: vm,
      tag: tag,
      key: key,
      data: data,
      children: children,
      text: text
    };
  }

  var id = 0; // 1. 当我们创建渲染watcher的时候 会把当前渲染watcher放到dep.target中
  // 2. 调用_render() 会取值 会走到get上

  var Watcher = /*#__PURE__*/function () {
    // 不同的组件有不同的watcher 目前只有一个 渲染根实例的
    function Watcher(vm, fn, options) {
      _classCallCheck(this, Watcher);

      this.id = id++;
      this.renderWatcher = options; // 是一个渲染watcher

      this.getter = fn; // getter意味着调用这个函数可以发生取值操作

      this.deps = []; // 实现计算属性和一些清理工作需要用到

      this.depsId = new Set();
      this.get();
    }

    _createClass(Watcher, [{
      key: "addDep",
      value: function addDep(dep) {
        // 一个组件对应多个属性 重复的属性也不用记录
        var id = dep.id;

        if (!this.depsId.has(id)) {
          this.deps.push(dep);
          this.depsId.add(id);
          dep.addSub(this); // watcher已经记住dep 而且已经去重 让dep也记住watcher
        }
      }
    }, {
      key: "get",
      value: function get() {
        Dep.target = this; // 静态属性

        this.getter(); // 会去vm上取值

        Dep.target = null; // 渲染完毕后清空
      }
    }, {
      key: "update",
      value: function update() {
        this.get();
      }
    }]);

    return Watcher;
  }(); // 需要给每个属性增加一个dep 目的就是收集watcher

  function createElm(vnode) {
    var tag = vnode.tag,
        data = vnode.data,
        children = vnode.children,
        text = vnode.text;

    if (typeof tag === 'string') {
      // 标签
      vnode.el = document.createElement(tag); // 这里将真实节点和虚拟节点对应起来，如果修改属性了

      patchProps(vnode.el, data);
      children.forEach(function (child) {
        vnode.el.appendChild(createElm(child));
      });
    } else {
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  }

  function patchProps(el, props) {
    for (var key in props) {
      if (key === 'style') {
        for (var styleName in props.style) {
          el.style[styleName] = props.style[styleName];
        }
      } else {
        el.setAttribute(key, props[key]);
      }
    }
  }

  function patch(oldVNode, vnode) {
    // 写的是初渲染流程
    var isRealElement = oldVNode.nodeType;

    if (isRealElement) {
      var elm = oldVNode;
      var parentElm = elm.parentNode; //拿到父元素

      var newElm = createElm(vnode);
      console.log('newEle: ', newElm);
      parentElm.insertBefore(newElm, elm.nextSibling);
      parentElm.removeChild(elm); // 删除老节点

      return newElm;
    }
  }

  function initLifeCycle(Vue) {
    Vue.prototype._update = function (vnode) {
      // patch既有初始化的功能 又有更新的功能
      var vm = this;
      var el = vm.$el;
      vm.$el = patch(el, vnode);
    };

    Vue.prototype._c = function () {
      return createElementVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    Vue.prototype._v = function () {
      return createTextVNode.apply(void 0, [this].concat(Array.prototype.slice.call(arguments)));
    };

    Vue.prototype._s = function (value) {
      if (value !== 'object') return value;
      return JSON.stringify(value);
    };

    Vue.prototype._render = function () {
      // 让with中的this指向vm
      return this.$options.render.call(this);
    };
  }
  function mountComponent(vm, el) {
    vm.$el = el; // 这里的el 是通过querySelector获取过的
    // 1. 调用render方法产生虚拟节点 虚拟dom

    var updateComponent = function updateComponent() {
      vm._update(vm._render()); // vm.$options.render() 虚拟节点

    }; // debugger;


    var watcher = new Watcher(vm, updateComponent, true); // true用于标识一个渲染watcher

    console.log('watcher: ', watcher); // 2. 根据虚拟dom产生真实dom
    // 3. 插入到el元素中
  } // vue的核心流程
  // 1。 创造了响应式数据
  // 2. 模版转换成ast语法树
  // 3. 将ast转换成了render函数，产生虚拟节点
  // 4. 后续每次数据更新可以只执行render函数 无需再次执行ast转换的过程
  // 5. render函数会去产生虚拟节点（使用响应式数据）
  // 6. 根据生成的虚拟节点创造真实的DOM

  function initMixin(Vue) {
    // 就是给Vue增加init方法
    Vue.prototype._init = function (options) {
      // 用于初始化操作
      // vue vm.$options 就是获取用户的配置
      var vm = this;
      vm.$options = options; // 将用户的选项挂在到实例上
      //初始化状态

      initState(vm);

      if (options.el) {
        vm.$mount(options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      var vm = this;
      el = document.querySelector(el);
      var opts = vm.$options;

      if (!opts.render) {
        // 先查找有没有render函数
        var template;

        if (!opts.template && el) {
          // 没写模版 但写了el
          template = el.outerHTML;
        } else {
          if (el) template = opts.template; // 如果有el 则采用模版的内容
        }

        console.log('template', template); // 写了tamplate 就用写了的template

        if (template) {
          // 这里需要对模版进行编译
          var render = compileToFunction(template);
          opts.render = render;
        }
      }

      mountComponent(vm, el); // 组件的挂载
      // opts.render; // 最终就可以获取render方法

      console.log('opts.render: ', opts.render);
    };
  }

  function Vue(options) {
    // options 就是用户的选项
    this._init(options);
  }

  initMixin(Vue); // 扩展了init方法

  initLifeCycle(Vue); //

  return Vue;

}));
//# sourceMappingURL=vue.js.map
