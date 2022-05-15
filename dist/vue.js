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

    Object.defineProperty(target, key, {
      get: function get() {
        console.log('用户取值了');
        return value;
      },
      set: function set(newValue) {
        // 修改的时候 会执行set
        if (value === newValue) return;
        observe(newValue); // 如果设置的值也是一个对象 也需要观测

        console.log('用户设置值了');
        value = newValue;
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
      currentParent = node;
      console.log('root', root);
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
    }

    console.log('cc', html);
    return root;
  }

  function compileToFunction(template) {
    // 1. 将template转换成ast语法树
    // 2. 生成render方法(render方法执行后返回的结果就是 虚拟DOM)
    // console.log('template1111: ', template);
    var ast = parseHTML(template);
    console.log('ast: ', ast);
  }

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

      opts.render; // 最终就可以获取render方法
    };
  }

  function Vue(options) {
    // options 就是用户的选项
    this._init(options);
  }

  initMixin(Vue); // 扩展了init方法

  return Vue;

}));
//# sourceMappingURL=vue.js.map
