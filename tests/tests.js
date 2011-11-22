(function(){
  var toString, document, Spec, Maddy, spec, print, K;
  toString = {}.toString;
  document = this.document, Spec = this.Spec, Maddy = this.Maddy;
  Spec == null && (Spec = typeof require === 'function'
    ? require('./vendor/spec').Spec
    : (typeof this.load == 'function' && this.load('vendor/spec.js'), this.Spec));
  spec = new Spec("Maddy Unit Tests");
  Maddy == null && (Maddy = typeof require === 'function'
    ? require('../lib/maddy')
    : (typeof this.load == 'function' && this.load('../lib/maddy.js'), this.Maddy));
  function onClick(){
    var target, _ref;
    target = (_ref = this.parentNode) != null ? _ref.getElementsByTagName('ol')[0] : void 8;
    return target != null ? target.style.display = target.style.display === 'none' ? "" : 'none' : void 8;
  }
  if (document != null) {
    spec.bind('all', function(_arg){
      var type, target, message, expected, actual, results, stats, status, element, name, queue, assertion, anticipated, data, provided, _ref, _i, _len;
      type = _arg.type, target = _arg.target, message = _arg.message, expected = _arg.expected, actual = _arg.actual;
      _ref = [document.getElementById('results'), document.getElementById('stats'), document.getElementById('status')], results = _ref[0], stats = _ref[1], status = _ref[2];
      switch (type) {
      case 'start':
        for (_i = 0, _len = (_ref = [results, stats, status]).length; _i < _len; ++_i) {
          element = _ref[_i];
          while (element.firstChild) {
            element.removeChild(element.firstChild);
          }
        }
        status.className = 'running';
        stats.appendChild(document.createTextNode('Running...'));
        break;
      case 'setup':
        (element = document.createElement('li')).className = 'running';
        (name = document.createElement('strong')).appendChild(document.createTextNode(target.name));
        name.onclick = onClick;
        element.appendChild(name);
        results.appendChild(element);
        break;
      case 'teardown':
        results.lastChild.className = target.failures ? 'fail' : 'pass';
        break;
      case 'complete':
        status.className = target.failures ? 'fail' : 'pass';
        stats.replaceChild(document.createTextNode(target.assertions + " assertions, " + target.failures + " failures."), stats.firstChild);
        results.parentNode.insertBefore(stats, results.nextSibling);
        break;
      default:
        element = results.lastChild;
        if (!(queue = element.getElementsByTagName('ol')[0])) {
          queue = document.createElement('ol');
          queue.style.display = 'none';
          element.appendChild(queue);
        }
        assertion = document.createElement('li');
        if (type === 'assertion') {
          assertion.className = 'assertion';
          assertion.appendChild(document.createTextNode(message));
        } else if (type === 'failure') {
          assertion.className = 'failure';
          assertion.appendChild(document.createTextNode(message));
          anticipated = document.createElement('span');
          anticipated.className = 'expected';
          anticipated.appendChild(document.createTextNode("Expected: "));
          data = document.createElement('code');
          data.appendChild(document.createTextNode(Maddy.stringify(expected)));
          anticipated.appendChild(data);
          assertion.appendChild(anticipated);
          provided = document.createElement('span');
          provided.className = 'actual';
          provided.appendChild(document.createTextNode("Actual: "));
          data = document.createElement('code');
          data.appendChild(document.createTextNode(Maddy.stringify(actual)));
          provided.appendChild(data);
          assertion.appendChild(provided);
        }
        queue.appendChild(assertion);
      }
    });
  } else {
    print = typeof (typeof console != 'undefined' && console !== null ? console.log : void 8) === 'function'
      ? function(message){
        return console.log(message);
      }
      : typeof this.print === 'function'
        ? this.print
        : function(){
          throw new Error("This environment does not support logging.");
        };
    spec.bind('all', function(_arg){
      var type, target, message, expected, actual;
      type = _arg.type, target = _arg.target, message = _arg.message, expected = _arg.expected, actual = _arg.actual;
      switch (type) {
      case 'start':
        print("Started spec `" + this.name + "`.");
        break;
      case 'setup':
        print("Started test `" + target.name + "`.");
        break;
      case 'assertion':
        print("Assertion: " + message + ".");
        break;
      case 'failure':
        print("Failure: " + message + ". Expected: " + stringify(expected) + ". Actual: " + stringify(actual) + ".");
        break;
      case 'teardown':
        print("Finished test `" + target.name + "`. " + target.assertions + " assertions, " + target.failures + " failures.");
        break;
      case 'complete':
        print("Finished spec `" + this.name + "`. " + this.assertions + " assertions, " + this.failures + " failures.");
      }
    });
  }
  K = function(key, value){
    return value;
  };
  if (document != null && (typeof require != 'undefined' && require !== null)) {
    spec.add("Async Module Loader Compatibility", function(){
      var _this = this;
      return setTimeout(function(){
        return _this.equal(Associative.version, Maddy.version, "Maddy is compatible with async module loaders").done(1);
      });
    });
  }
  spec.add('curry', Maddy.curry(function(_arg){
    var curry, units, truncate;
    curry = _arg.curry;
    units = function(ratio, symbol, input){
      return [(input * ratio).toFixed(1), symbol].join(" ");
    };
    this.equal(curry(units), units, "The original function is returned if no arguments were specified for partial application");
    this.equal(curry(units, 2.2, 'lbs.')(4), "8.8 lbs.", "Two of three arguments specified for partial application; curried function called with one argument");
    this.equal(curry(units, 1.75)("imperial pints", 2.4), "4.2 imperial pints", "One of three arguments specified for partial application; curried function called with two arguments");
    this.equal(curry(units, 1.98, "U.S. pints", 2.4)(), "4.8 U.S. pints", "All required arguments specified for partial application; curried function called with no arguments");
    this.equal(curry(units, 1.62, 'km', 34)(1, 2, 3), "55.1 km", "The original function ignores any additional arguments passed to the curried function");
    truncate = function(length, truncation){
      var lastIndex;
      if (truncation == null) {
        return String(this);
      }
      lastIndex = length - truncation.length;
      if (lastIndex > 0) {
        return this.slice(0, lastIndex) + truncation;
      } else {
        return truncation;
      }
    };
    this.equal(curry(truncate).call("Kit Cambridge", 10, '...'), "Kit Cam...", "No arguments specified for partial application; original function can be invoked on a string primitive");
    this.equal(curry(truncate, 8).call("Mathias Bynens", '~'), "Mathias~", "One argument specified for partial application; curried function can be invoked on a string primitive");
    this.equal(curry(truncate, 6, '-').call("Maddy Jalbert"), "Maddy-", "All required arguments specified for partial application; string truncated accordingly");
    this.equal(curry(truncate, 4).call("John-David Dalton"), "John-David Dalton", "One of two required arguments passed to the curried function; string not truncated");
    return this.done(9);
  }, Maddy));
  spec.add('isPropertyOf', Maddy.curry(function(_arg){
    var curry, isPropertyOf, Class, isDirect, isPrototype;
    curry = _arg.curry, isPropertyOf = _arg.isPropertyOf;
    Class = (function(){
      Class.displayName = 'Class';
      var prototype = Class.prototype;
      function Class(){
        this.valueOf = this.toString = 1;
      }
      prototype.isPrototypeOf = prototype.hasOwnProperty = prototype.valueOf = 1;
      return Class;
    }());
    isDirect = curry(isPropertyOf, new Class);
    this.ok(isDirect('valueOf'), "The instance property `valueOf` shadows a property on the prototype");
    this.ok(isDirect('toString'), "The instance property `toString` shadows a property on the prototype");
    this.ok(!isDirect('isPrototypeOf'), "`isPrototypeOf` is an inherited property");
    this.ok(!isDirect('propertyIsEnumerable'), "`propertyIsEnumerable` is an inherited property");
    isPrototype = curry(isPropertyOf, Class.prototype);
    this.ok(isPrototype('hasOwnProperty'), "The prototype property `hasOwnProperty` shadows a property on `Object.prototype`");
    this.ok(isPrototype('isPrototypeOf'), "The prototype property `isPrototypeOf` shadows a property on `Object.prototype`");
    this.ok(isPrototype('valueOf'), "The prototype property `valueOf` shadows a property on `Object.prototype`");
    this.ok(!isPrototype('toString'), "`toString` is a property inherited from `Object.prototype`");
    this.ok(isPropertyOf(Class, 'prototype'), "The constructor property `prototype` is a direct property");
    return this.done(9);
  }, Maddy));
  spec.add('getClassOf', Maddy.curry(function(_arg){
    var getClassOf, _ref;
    getClassOf = _arg.getClassOf;
    this.equal(getClassOf(null), 'Null', "The `[[Class]]` name of a `null` value is `Null`");
    this.equal(getClassOf(), 'Undefined', "The `[[Class]]` name of an `undefined` value is `Undefined`");
    this.equal(getClassOf({}), 'Object', "The `[[Class]]` name of an object literal is `Object`");
    this.equal(getClassOf({
      length: (_ref = []).length,
      push: _ref.push,
      slice: _ref.slice
    }), 'Object', "The `[[Class]]` name of an array-like object is `Object`");
    this.equal(getClassOf(function(){}), 'Function', "The `[[Class]]` name of a function is `Function`");
    this.equal(getClassOf([]), 'Array', "The `[[Class]]` name of an array literal is `Array`");
    this.equal(getClassOf(/(?:)/), 'RegExp', "The `[[Class]]` name of a RegExp is `RegExp`");
    this.equal(getClassOf(new Date), 'Date', "The `[[Class]]` name of a `Date` instance is `Date`");
    this.equal(getClassOf(new Error), 'Object', "The normalized `[[Class]]` of an `Error` object is `Object`");
    this.equal(getClassOf('Kit'), 'String', "The `[[Class]]` name of a string primitive is `String`");
    this.equal(getClassOf(new String('Maddy')), 'String', "The `[[Class]]` name of a string object is `String`");
    this.equal(getClassOf(true), 'Boolean', "The `[[Class]]` name of a boolean primitive is `Boolean`");
    this.equal(getClassOf(new Boolean), 'Boolean', "The `[[Class]]` name of a boolean object is `Boolean`");
    this.equal(getClassOf(63), 'Number', "The `[[Class]]` name of a number primitive is `Number`");
    this.equal(getClassOf(new Number(61)), 'Number', "The `[[Class]]` name of a number object is `Number`");
    return this.done(15);
  }, Maddy));
  spec.add('forEach', Maddy.curry(function(_arg){
    var forEach, curry, Class, size, result, _this = this;
    forEach = _arg.forEach, curry = _arg.curry;
    Class = (function(){
      Class.displayName = 'Class';
      var _ref, prototype = Class.prototype;
      function Class(){
        var _ref;
        _ref = [1, 2, 3], this['length'] = _ref[0], this['valueOf'] = _ref[1], this['toString'] = _ref[2];
      }
      _ref = [4, 5, 6, 7, 8, 9], prototype['constructor'] = _ref[0], prototype['toString'] = _ref[1], prototype['toLocaleString'] = _ref[2], prototype['isPrototypeOf'] = _ref[3], prototype['propertyIsEnumerable'] = _ref[4], prototype['hasOwnProperty'] = _ref[5];
      return Class;
    }());
    size = 0;
    forEach(function(key, value, object){
      size++;
      _this.equal(value, object[key], "The callback function accepts `key` and `value` arguments");
      return false;
    }, new Class);
    this.equal(size, 1, "Explicitly returning `false` breaks the loop");
    size = 0;
    forEach(function(key, value){
      size++;
      switch (key) {
      case 'length':
        return _this.equal(value, 1, "The direct `length` property is enumerated");
      case 'valueOf':
        return _this.equal(value, 2, "The direct `valueOf` property is enumerated");
      case 'toString':
        return _this.equal(value, 3, "The shadowed `toString` property is enumerated once");
      }
    }, new Class);
    this.equal(size, 3, "The `Class` instance should contain three direct properties");
    size = 0;
    forEach(function(key, value){
      size++;
      switch (key) {
      case 'constructor':
        return _this.equal(value, 4, "The direct `constructor` prototype property is enumerated");
      case 'toString':
        return _this.equal(value, 5, "The direct `toString` prototype property is enumerated");
      case 'toLocaleString':
        return _this.equal(value, 6, "The direct `toLocaleString` prototype property is enumerated");
      case 'isPrototypeOf':
        return _this.equal(value, 7, "The direct `isPrototypeOf` prototype property is enumerated");
      case 'propertyIsEnumerable':
        return _this.equal(value, 8, "The direct `propertyIsEnumerable` prototype property is enumerated");
      case 'hasOwnProperty':
        return _this.equal(value, 9, "The direct `hasOwnProperty` prototype property is enumerated");
      }
    }, Class.prototype);
    this.equal(size, 6, "The `Class` prototype should contain six direct properties");
    result = true;
    forEach(function(it){
      if (it === 'prototype') {
        return result = false;
      }
    }, Class);
    this.ok(result, "The `prototype` property of functions should not be enumerated");
    return this.done(14);
  }, Maddy));
  spec.add('isEqual', Maddy.curry(function(_arg){
    var isEqual, First, Second, A, B;
    isEqual = _arg.isEqual;
    First = (function(){
      First.displayName = 'First';
      var prototype = First.prototype;
      prototype.toString = 1;
      function First(){
        this.toString = 1;
      }
      return First;
    }());
    Second = (function(){
      Second.displayName = 'Second';
      var prototype = Second.prototype;
      prototype.toString = 2;
      function Second(){
        this.toString = 1;
      }
      return Second;
    }());
    this.ok(!isEqual(0, -0), "`0` is not equal to `-0`");
    this.ok(!isEqual(-0, 0), "Commutative equality is implemented for `0` and `-0`");
    this.ok(isEqual(null, null), "`null` is equal to `null`");
    this.ok(isEqual(), "`undefined` is equal to `undefined`");
    this.ok(!isEqual(null, void 8), "`null` is not equal to `undefined`");
    this.ok(!isEqual(void 8, null), "Commutative equality is implemented for `null` and `undefined`");
    this.ok(isEqual('Maddy', 'Maddy'), "Identical string primitives are equal");
    this.ok(isEqual(new String('Maddy'), 'Maddy'), "String primitives and their corresponding object wrappers are equal");
    this.ok(isEqual('Maddy', new String('Maddy')), "Commutative equality is implemented for strings");
    this.ok(isEqual(new String('Maddy'), new String('Maddy')), "String objects with identical primitive values are equal");
    this.ok(!isEqual(new String('Maddy'), new String('Kit')), "String objects with different primitive values are not equal");
    this.ok(!isEqual(new String('Maddy'), 'Kit'), "String objects and primitives with different values are not equal");
    this.ok(!isEqual(new String('Maddy'), {
      toString: function(){
        return 'Maddy';
      }
    }), "String objects and objects with a custom `toString` method are not equal");
    this.ok(isEqual(75, 75), "Identical number primitives are equal");
    this.ok(isEqual(75, new Number(75)), "Number primitives and their corresponding object wrappers are equal");
    this.ok(isEqual(new Number(75), 75), "Commutative equality is implemented for numbers");
    this.ok(isEqual(new Number(75), new Number(75)), "Number objects with identical primitive values are equal");
    this.ok(!isEqual(new Number(75), new Number(63)), "Number objects with different primitive values are not equal");
    this.ok(!isEqual(new Number(63), {
      valueOf: function(){
        return 63;
      }
    }), "Number objects and objects with a `valueOf` method are not equal");
    this.ok(!isEqual(new Number(0), -0), "`new Number(0)` and `-0` are not equal");
    this.ok(!isEqual(0, new Number(-0)), "Commutative equality is implemented for `new Number(0)` and `-0`");
    this.ok(isEqual(NaN, NaN), "`NaN` is equal to `NaN`");
    this.ok(!isEqual(61, NaN), "A number primitive is not equal to `NaN`");
    this.ok(!isEqual(new Number(79), NaN), "A number object is not equal to `NaN`");
    this.ok(!isEqual(Infinity, NaN), "`Infinity` is not equal to `NaN`");
    this.ok(isEqual(true, true), "Identical boolean primitives are equal");
    this.ok(isEqual(true, new Boolean(true)), "Boolean primitives and their corresponding object wrappers are equal");
    this.ok(isEqual(new Boolean(true), true), "Commutative equality is implemented for booleans");
    this.ok(isEqual(new Boolean, new Boolean), "Boolean objects with identical primitive values are equal");
    this.ok(!isEqual(new Boolean(true), new Boolean), "Boolean objects with different primitive values are not equal");
    this.ok(!isEqual(true, new Boolean(false)), "Boolean objects are not equal to the boolean primitive `true`");
    this.ok(!isEqual("75", 75), "String and number primitives with like values are not equal");
    this.ok(!isEqual(new Number(63), new String(63)), "String and number objects with like values are not equal");
    this.ok(!isEqual(75, "75"), "Commutative equality is implemented for like string and number values");
    this.ok(!isEqual(0, ""), "Number and string primitives with like values are not equal");
    this.ok(!isEqual(1, true), "Number and boolean primitives with like values are not equal");
    this.ok(!isEqual(new Boolean(false), new Number(0)), "Boolean and number objects with like values are not equal");
    this.ok(!isEqual(false, new String("")), "Boolean primitives and string objects with like values are not equal");
    this.ok(!isEqual(7732152e5, new Date(1994, 6, 3)), "Dates and their corresponding numeric primitive values are not equal");
    this.ok(isEqual(new Date(1994, 6, 3), new Date(1994, 6, 3)), "Date objects referencing identical times are equal");
    this.ok(!isEqual(new Date(1994, 6, 3), new Date(1993, 5, 2)), "Date objects referencing different times are not equal");
    this.ok(!isEqual(new Date(1993, 5, 2), {
      getTime: function(){
        return 7390008e5;
      }
    }), "Date objects and objects with a `getTime` method are not equal");
    this.ok(!isEqual(new Date('Maddy'), new Date('Maddy')), "Invalid dates are not equal");
    this.ok(!isEqual(First, Second), "Different functions with identical bodies and source code representations are not equal");
    this.ok(isEqual(/(?:)/gim, /(?:)/gim), "RegExps with equivalent patterns and flags are equal");
    this.ok(!isEqual(/(?:)/g, /(?:)/gi), "RegExps with equivalent patterns and different flags are not equal");
    this.ok(!isEqual(/Maddy/gim, /Kit/gim), "RegExps with different patterns and equivalent flags are not equal");
    this.ok(!isEqual(/(?:)/gi, /(?:)/g), "Commutative equality is implemented for RegExps");
    this.ok(!isEqual(/Kit/g, {
      source: 'Kit',
      global: true,
      ignoreCase: false,
      multiline: false
    }), "RegExps and RegExp-like objects are not equal");
    this.ok(isEqual({}, {}), "Empty object literals are equal");
    this.ok(isEqual([], []), "Empty array literals are equal");
    this.ok(isEqual([{}], [{}]), "Empty nested arrays and objects are equal");
    this.ok(!isEqual({}, []), "Object literals and array literals are not equal");
    this.ok(!isEqual([], {}), "Commutative equality is implemented for objects and arrays");
    this.ok(!isEqual({
      length: 0
    }, []), "Array-like objects and arrays are not equal");
    this.ok(!isEqual([], {
      length: 0
    }), "Commutative equality is implemented for array-like objects");
    this.ok(isEqual([1, 'Kit', true], [1, 'Kit', true]), "Arrays containing identical primitives are equal");
    this.ok(isEqual([/Maddy/g, new Date(1994, 6, 3)], [/Maddy/g, new Date(1994, 6, 3)]), "Arrays containing equivalent elements are equal");
    A = [
      new Number(47), new Boolean, new String('Kit'), /Maddy/, new Date(1993, 5, 2), ['running', 'biking', 'programming'], {
        a: 47
      }
    ];
    B = [
      new Number(47), false, 'Kit', /Maddy/, new Date(1993, 5, 2), ['running', 'biking', new String('programming')], {
        a: new Number(47)
      }
    ];
    this.ok(isEqual(A, B), "Arrays containing nested arrays and objects are recursively compared");
    A.forEach = A.map = A.filter = A.every = A.indexOf = A.lastIndexOf = A.some = A.reduce = A.reduceRight = null;
    B.join = B.pop = B.reverse = B.shift = B.slice = B.splice = B.concat = B.sort = B.unshift = null;
    this.ok(isEqual(A, B), "Arrays containing equivalent elements and different non-numeric properties are equal");
    A.push("White Rocks");
    this.ok(!isEqual(A, B), "Arrays of different lengths are not equal");
    A.push("East Boulder");
    B.push("Gunbarrel Ranch", "Teller Farm");
    this.ok(!isEqual(A, B), "Arrays of identical lengths containing different elements are not equal");
    this.ok(isEqual(Array(3), Array(3)), "Sparse arrays of identical lengths are equal");
    this.ok(!isEqual(Array(3), Array(6)), "Sparse arrays of different lengths are not equal");
    if (0 in [void 8]) {
      this.ok(!isEqual(Array(3), [void 8, void 8, void 8]), "Sparse and dense arrays are not equal");
      this.ok(!isEqual([void 8, void 8, void 8], Array(3)), "Commutative equality is implemented for sparse and dense arrays");
    }
    this.ok(isEqual({
      a: 'Maddy',
      b: 1,
      c: true
    }, {
      a: 'Maddy',
      b: 1,
      c: true
    }), "Objects containing identical primitives are equal");
    this.ok(isEqual({
      a: /Kit/g,
      b: new Date(1993, 5, 2)
    }, {
      a: /Kit/g,
      b: new Date(1993, 5, 2)
    }), "Objects containing equivalent members are equal");
    this.ok(!isEqual({
      a: 63,
      b: 75
    }, {
      a: 61,
      b: 55
    }), "Objects of identical sizes with different values are not equal");
    this.ok(!isEqual({
      a: 63,
      b: 75
    }, {
      a: 61,
      c: 55
    }), "Objects of identical sizes with different property names are not equal");
    this.ok(!isEqual({
      a: 1,
      b: 2
    }, {
      a: 1
    }), "Objects of different sizes are not equal");
    this.ok(!isEqual({
      a: 1
    }, {
      a: 1,
      b: 2
    }), "Commutative equality is implemented for objects");
    this.ok(!isEqual({
      x: 1,
      y: void 8
    }, {
      x: 1,
      z: 2
    }), "Objects with identical keys and different values are not equivalent");
    A = {
      name: new String("Kit Cambridge"),
      age: 18,
      developer: true,
      hobbies: [new String('running'), 'biking', 'programming'],
      coords: {
        intersection: ["75th Street", new String("East Boulder Trail")],
        latitude: 40.07,
        longitude: new Number(-105.178)
      }
    };
    B = {
      name: "Kit Cambridge",
      age: new Number(18),
      developer: new Boolean(true),
      hobbies: ['running', 'biking', new String('programming')],
      coords: {
        intersection: [new String("75th Street"), "East Boulder Trail"],
        latitude: new Number(40.07),
        longitude: -105.178
      }
    };
    this.ok(isEqual(A, B), "Objects with nested equivalent members are recursively compared");
    A.constructor = A.hasOwnProperty = A.isPrototypeOf = A.propertyIsEnumerable = A.toString = A.toLocaleString = A.valueOf = null;
    B.constructor = B.hasOwnProperty = B.isPrototypeOf = B.propertyIsEnumerable = null;
    this.ok(!isEqual(A, B), "Objects with different own properties are not equal");
    B.toString = B.toLocaleString = B.valueOf = null;
    this.ok(isEqual(A, B), "Objects with identical own properties are equal");
    this.ok(isEqual(new First, new First), "Object instances are equal");
    this.ok(isEqual(new First, new Second), "Objects with different constructors and identical own properties are equal");
    this.ok(isEqual({
      toString: new Number(1)
    }, new First), "Object instances and objects sharing equivalent properties are identical");
    this.ok(!isEqual({
      toString: 2
    }, new Second), "The prototype chain of objects should not be examined");
    (A = []).push(A);
    (B = []).push(B);
    this.ok(isEqual(A, B), "Arrays containing circular references are equal");
    A.push(new String('Kit'));
    B.push('Kit');
    this.ok(isEqual(A, B), "Arrays containing circular references and equivalent properties are equal");
    A.push('John-David');
    B.push(new String('Maddy'));
    this.ok(!isEqual(A, B), "Arrays containing circular references and different properties are not equal");
    A = {
      abc: null
    };
    B = {
      abc: null
    };
    A.abc = A;
    B.abc = B;
    this.ok(isEqual(A, B), "Objects containing circular references are equal");
    A.def = new Number(75);
    B.def = 75;
    this.ok(isEqual(A, B), "Objects containing circular references and equivalent properties are equal");
    A.def = 75;
    B.def = new Number(63);
    this.ok(!isEqual(A, B), "Objects containing circular references and different properties are not equal");
    A = [{
      abc: null
    }];
    B = [{
      abc: null
    }];
    (A[0].abc = A).push(A);
    (B[0].abc = B).push(B);
    this.ok(isEqual(A, B), "Cyclic structures are equal");
    A[0].def = new String('Kit');
    B[0].def = 'Kit';
    this.ok(isEqual(A, B), "Cyclic structures containing equivalent properties are equal");
    A[0].def = 'Kit';
    B[0].def = new String('Maddy');
    this.ok(!isEqual(A, B), "Cyclic structures containing different properties are not equal");
    A = {
      foo: {
        b: {
          foo: {
            c: {
              foo: null
            }
          }
        }
      }
    };
    B = {
      foo: {
        b: {
          foo: {
            c: {
              foo: null
            }
          }
        }
      }
    };
    A.foo.b.foo.c.foo = A;
    B.foo.b.foo.c.foo = B;
    this.ok(isEqual(A, B), "Cyclic structures with nested and identically-named properties are equal");
    return this.done();
  }, Maddy));
  spec.add('stringify', Maddy.curry(function(_arg){
    var stringify, A, cyclic;
    stringify = _arg.stringify;
    this.equal(stringify(null), 'null', "`null` is serialized as-is");
    this.equal(stringify(), 'null', "`undefined` values are converted to `null`");
    this.equal(stringify(Infinity), 'null', "`Infinity` is converted to `null`");
    this.equal(stringify(NaN), 'null', "`NaN` is converted to `null`");
    this.equal(stringify(function(){}), 'null', "Functions are converted to `null`");
    this.equal(stringify(/Kit/), "{\"source\": \"Kit\", \"global\": false, \"ignoreCase\": false, \"multiline\": false}", "RegExps are serialized as standard objects");
    this.equal(stringify(/Maddy/gi), "{\"source\": \"Maddy\", \"global\": true, \"ignoreCase\": true, \"multiline\": false}", "RegExp flags set the corresponding properties accordingly");
    this.equal(stringify(true), 'true', "`true` is serialized as-is");
    this.equal(stringify(new Boolean(false)), 'false', "`false` is serialized as-is");
    this.equal(stringify('Kit'), '"Kit"', "String values are double-quoted");
    this.equal(stringify(new String('\\"Hello\bworld\tthis\nis\fnice\r"')), '"\\\\\\"Hello\\bworld\\tthis\\nis\\fnice\\r\\""', "All control characters are escaped");
    this.equal(stringify(new Date(1994, 6, 3)), '"1994-07-03T06:00:00.000Z"', "Dates are serialized using the simplified date time string format");
    this.equal(stringify(new Date(1993, 5, 2, 2, 10, 28, 224)), '"1993-06-02T08:10:28.224Z"', "The date time string conforms to the format outlined in the spec");
    this.equal(stringify([new Boolean, new Number(1), new String('Maddy')]), "[false, 1, \"Maddy\"]", "Arrays are recursively serialized");
    (A = []).push(1, A, 2, A, 3, A);
    this.equal(stringify(A), "[1, null, 2, null, 3, null]", "Circular array references are replaced with `null`");
    this.equal(stringify({
      jdalton: 'John-David',
      kitcam: 'Kit',
      M_J: 'Maddy'
    }), "{\"jdalton\": \"John-David\", \"kitcam\": \"Kit\", \"M_J\": \"Maddy\"}", "Objects are recursively serialized");
    (A = {
      def: null
    }).def = A;
    this.equal(stringify(A), "{\"def\": null}", "Circular object references are replaced with `null`");
    cyclic = {
      foo: {
        b: {
          foo: {
            c: {
              foo: null
            }
          }
        }
      }
    };
    cyclic.foo.b.foo.c.foo = cyclic;
    this.equal(stringify(cyclic), "{\"foo\": {\"b\": {\"foo\": {\"c\": {\"foo\": null}}}}}", "Complex circular references are serialized correctly");
    return this.done(18);
  }, Maddy));
  spec.add("map, collect", Maddy.curry(function(_arg){
    var map, collect, developers, callback;
    map = _arg.map, collect = _arg.collect;
    developers = {
      jdalton: {
        name: 'John-David',
        age: 29
      },
      mathias: {
        name: 'Mathias',
        age: 23
      },
      kitcam: {
        name: 'Kit',
        age: 18
      }
    };
    callback = function(key, value){
      return [value['name'], value['age']];
    };
    this.deepEqual(map(callback, developers), {
      jdalton: ['John-David', 29],
      mathias: ['Mathias', 23],
      kitcam: ['Kit', 18]
    }, "`map` can transform the values of an object");
    callback = function(key, value){
      return [key, value.age * this.K];
    };
    this.deepEqual(collect(callback, {
      K: 10
    }, developers), {
      jdalton: ['jdalton', 290],
      mathias: ['mathias', 230],
      kitcam: ['kitcam', 180]
    }, "`collect` accepts a `context` argument");
    return this.done(2);
  }, Maddy));
  spec.add("fold, inject, reduce", Maddy.curry(function(_arg){
    var fold, inject, reduce, ages, callback;
    fold = _arg.fold, inject = _arg.inject, reduce = _arg.reduce;
    ages = {
      jdalton: 29,
      mathias: 23,
      M_J: 17
    };
    callback = function(memo, name, age){
      return memo + age;
    };
    this.error(function(){
      return fold(callback, ages);
    }, /TypeError/, "`fold` throws a `TypeError` if the initial value is omitted");
    this.equal(inject(callback, 0, ages), 69, "`inject` can sum the numeric values of an object");
    callback = function(memo, name, age){
      memo[age * this.K] = name;
      return memo;
    };
    this.deepEqual(reduce(callback, {
      K: 10
    }, {}, ages), {
      290: 'jdalton',
      230: 'mathias',
      170: 'M_J'
    }, "`reduce` accepts a `context` argument");
    return this.done(3);
  }, Maddy));
  spec.add("some, any", Maddy.curry(function(_arg){
    var some, any, languages;
    some = _arg.some, any = _arg.any;
    languages = {
      JavaScript: 1996,
      Haskell: 1990,
      Perl: 1987,
      Python: 1991,
      Ruby: 1993
    };
    this.ok(!some(K, {}), "`some` returns `false` for an empty object");
    this.ok(!any(K, {
      Kit: false,
      Mathias: false,
      Maddy: false
    }), "`any` returns `false` for an object containing all falsy values");
    this.ok(some(K, {
      Kit: false,
      Mathias: false,
      Maddy: true
    }), "`some` returns `true` for an object containing at least one truthy value");
    this.ok(any(function(key, value){
      return key > "Delphi" && value > 1990;
    }, languages), "`any` returns `true` if the object contains at least one matching member");
    this.ok(!any(function(key, value){
      return key > "Visual Basic";
    }, languages), "`any` returns `false` if no matching members are found");
    return this.done(5);
  }, Maddy));
  spec.add("select, findAll, filter", Maddy.curry(function(_arg){
    var select, findAll, filter, libraries;
    select = _arg.select, findAll = _arg.findAll, filter = _arg.filter;
    libraries = {
      Prototype: 2005,
      jQuery: 2006,
      MooTools: 2006,
      YUI: 2005,
      Underscore: 2009
    };
    this.deepEqual(select(function(library, year){
      return year > 2004;
    }, libraries), libraries, "`select` returns a shallow copy if all members match the specified criteria");
    this.deepEqual(findAll(function(library){
      return library < "Dojo";
    }, libraries), {}, "`findAll` returns an empty set if no matching members are found");
    this.deepEqual(filter(function(library, year){
      return library > "Sencha" && year > 2007;
    }, libraries), {
      Underscore: 2009
    }, "`filter returns a set of members that match the specified criteria");
    return this.done(3);
  }, Maddy));
  spec.add("all, every", Maddy.curry(function(_arg){
    var all, every, languages;
    all = _arg.all, every = _arg.every;
    languages = {
      JavaScript: 1996,
      Haskell: 1990,
      Perl: 1987,
      Python: 1991,
      Ruby: 1993
    };
    this.ok(all(K, {}), "`all` is vacuously true for an empty object");
    this.ok(every(K, {
      Kit: true,
      Mathias: true,
      Maddy: true
    }), "`every` returns `true` for an object containing all truthy values");
    this.ok(!all(K, {
      Kit: true,
      Mathias: false,
      Maddy: true
    }), "`all` returns `false` for an object containing one or more falsy values");
    this.ok(!every(function(key, value){
      return key > "Delphi" && value > 1990;
    }, languages), "`every` returns `false` if one or more members do not match");
    this.ok(all(function(key, value){
      return key < "Visual Basic";
    }, languages), "`all` returns `true` only if all members match the criteria");
    return this.done(5);
  }, Maddy));
  spec.add('reject', Maddy.curry(function(_arg){
    var reject, libraries;
    reject = _arg.reject;
    libraries = {
      Prototype: 2005,
      jQuery: 2006,
      MooTools: 2006,
      YUI: 2005,
      Underscore: 2009
    };
    this.deepEqual(reject(function(library){
      return library > "Backbone";
    }, libraries), {}, "`reject` returns an empty set if all members match the specified criteria");
    this.deepEqual(reject(function(library, year){
      return library < "Qooxdoo" || year < 2006;
    }, libraries), {
      jQuery: 2006,
      Underscore: 2009
    }, "`reject` returns a set of members that do not match the specified criteria");
    this.deepEqual(reject(function(library, year){
      return year > 2009;
    }, libraries), libraries, "`reject` returns a shallow copy if no members match the specified criteria");
    return this.done(3);
  }, Maddy));
  spec.add("invoke, send", Maddy.curry(function(_arg){
    var invoke, send, names;
    invoke = _arg.invoke, send = _arg.send;
    names = {
      jdalton: [
        'John-David', 29, {
          glasses: true
        }, 'programmer'
      ],
      kitcam: [
        'Kit', 18, {
          glasses: true
        }, 'programmer'
      ],
      M_J: [
        'Maddy', 17, {
          glasses: false
        }, 'runner'
      ]
    };
    this.deepEqual(send(names, 'pop'), {
      jdalton: 'programmer',
      kitcam: 'programmer',
      M_J: 'runner'
    }, "`send` invokes a method on every member value");
    this.deepEqual(invoke(names, 'slice', 1, -1), {
      jdalton: [29],
      kitcam: [18],
      M_J: [17]
    }, "`invoke` accepts optional arguments for each method");
    return this.done(2);
  }, Maddy));
  spec.add('max', Maddy.curry(function(_arg){
    var max, names;
    max = _arg.max;
    names = {
      jdalton: {
        name: 'John-David',
        age: 29
      },
      M_J: {
        name: 'Maddy',
        age: 17
      },
      kitcam: {
        name: 'Kit',
        age: 18
      }
    };
    this.equal(max(function(name, _arg){
      var age;
      age = _arg.age;
      return age;
    }, names), 'jdalton', "`max` returns the maximum member value as computed by the callback function");
    return this.done(1);
  }, Maddy));
  spec.add('min', Maddy.curry(function(_arg){
    var min, names;
    min = _arg.min;
    names = {
      jdalton: {
        name: 'John-David',
        age: 29
      },
      M_J: {
        name: 'Maddy',
        age: 17
      },
      kitcam: {
        name: 'Kit',
        age: 18
      }
    };
    this.equal(min(function(name, _arg){
      var age;
      age = _arg.age;
      return age;
    }, names), 'M_J', "`min` returns the minimum member value as computed by the callback function");
    return this.done(1);
  }, Maddy));
  spec.add('partition', Maddy.curry(function(_arg){
    var partition, names, results;
    partition = _arg.partition;
    names = {
      jdalton: "John-David Dalton",
      mathias: "Mathias Bynens",
      kitcam: "Kit Cambridge",
      M_J: "Maddy Jalbert"
    };
    results = [
      {
        jdalton: "John-David Dalton",
        mathias: "Mathias Bynens"
      }, {
        kitcam: "Kit Cambridge",
        M_J: "Maddy Jalbert"
      }
    ];
    this.deepEqual(partition(function(user, name){
      return name.length > 13;
    }, names), results, "`partition` separates object members using the criteria specified by the callback");
    return this.done(1);
  }, Maddy));
  spec.add('groupBy', Maddy.curry(function(_arg){
    var groupBy, guests, groups;
    groupBy = _arg.groupBy;
    guests = {
      Kit: 'lasagna',
      Mathias: 'sushi',
      Maddy: 'lasagna',
      Alex: 'soup',
      Sam: 'pierogi',
      Jeremy: 'sushi',
      Tom: 'sushi'
    };
    groups = {
      lasagna: {
        Kit: 'lasagna',
        Maddy: 'lasagna'
      },
      sushi: {
        Mathias: 'sushi',
        Jeremy: 'sushi',
        Tom: 'sushi'
      },
      soup: {
        Alex: 'soup'
      },
      pierogi: {
        Sam: 'pierogi'
      }
    };
    this.deepEqual(groupBy(function(name, food){
      return food;
    }, guests), groups, "`groupBy` groups members using the criteria specified by the callback");
    return this.done(1);
  }, Maddy));
  spec.add('keys', Maddy.curry(function(_arg){
    var keys, exception, sparse, names;
    keys = _arg.keys;
    exception = /TypeError/;
    sparse = Array(10);
    names = {
      jdalton: 'John-David',
      mathias: 'Mathias',
      M_J: 'Maddy'
    };
    this.deepEqual(keys(names), ['M_J', 'jdalton', 'mathias'], "`keys` should return a lexicographically-sorted array of direct property names");
    sparse.push(1);
    this.deepEqual(keys(sparse), ['10'], "A sparse array should contain only one key");
    this.error(function(){
      return keys(null);
    }, exception, "`null` should throw a `TypeError");
    this.error(function(){
      return keys();
    }, exception, "`undefined` should throw a `TypeError");
    this.error(function(){
      return keys(1);
    }, exception, "`Number primitives should throw a `TypeError");
    this.error(function(){
      return keys('Maddy');
    }, exception, "String primitives should throw a `TypeError");
    this.error(function(){
      return keys(true);
    }, exception, "Boolean primitives should throw a `TypeError");
    return this.done(7);
  }, Maddy));
  spec.add('extend', Maddy.curry(function(_arg){
    var extend;
    extend = _arg.extend;
    this.deepEqual(extend({}, {
      a: 'b'
    }), {
      a: 'b'
    }, "`extend` can copy source properties to the target object");
    this.deepEqual(extend({
      a: 'x'
    }, {
      a: 'b'
    }), {
      a: 'b'
    }, "Non-unique source properties should overwrite destination properties");
    this.deepEqual(extend({
      x: 'x'
    }, {
      a: 'b'
    }), {
      x: 'x',
      a: 'b'
    }, "Unique source properties should be copied to the target object");
    this.deepEqual(extend({
      x: 'x'
    }, {
      a: 'a',
      x: 2
    }, {
      a: 'b'
    }), {
      x: 2,
      a: 'b'
    }, "The last defined property should be used when multiple source objects are provided");
    return this.done(4);
  }, Maddy));
  spec.add('isEmpty', Maddy.curry(function(_arg){
    var isEmpty, Class, kit;
    isEmpty = _arg.isEmpty;
    Class = (function(){
      Class.displayName = 'Class';
      var prototype = Class.prototype;
      prototype.toString = 1;
      function Class(){}
      return Class;
    }());
    kit = {
      kitcam: 'Kit'
    };
    this.ok(isEmpty(null), "`null` is an empty value");
    this.ok(isEmpty(), "`undefined` is an empty value");
    this.ok(isEmpty(NaN), "`NaN` is indeterminate");
    this.ok(isEmpty(Infinity), "`Infinity` is indeterminate");
    this.ok(isEmpty(-Infinity), "`-Infinity` is indeterminate");
    this.ok(isEmpty(new Date("M")), "Invalid dates are indeterminate");
    this.ok(isEmpty([]), "Zero-length array literals are empty");
    this.ok(isEmpty({}), "Zero-member object literals are empty");
    this.ok(isEmpty(new Class), "Object instances with no direct properties are empty");
    this.ok(isEmpty(""), "Zero-length string primitives are empty");
    this.ok(isEmpty(new String), "Zero-length string objects are empty");
    this.ok(!isEmpty('John-David'), "Strings containing one or more characters are not empty");
    this.ok(!isEmpty(new Date), "Valid dates are not empty");
    this.ok(!isEmpty(/(?:)/), "RegExps are not empty");
    this.ok(!isEmpty(false), "Boolean primitives are not empty");
    this.ok(!isEmpty([1, 2, 3]), "Arrays containing one or more elements are not empty");
    this.ok(!isEmpty(kit), "Object literals with one or members are not empty");
    delete kit.kitcam;
    this.ok(isEmpty(kit), "Removing all direct properties from an object should empty it");
    return this.done(18);
  }, Maddy));
  if (typeof define === 'function' && define.amd != null) {
    define(function(){
      return spec;
    });
  } else if (document != null && 'onload' in this) {
    this.onload = function(){
      return spec.run();
    };
  } else {
    spec.run();
  }
}).call(this);
