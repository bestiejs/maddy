(function(){
  var toString, document, Spec, Maddy, spec, print;
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
      if (!(results && stats && status)) {
        return;
      }
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
        element = document.createElement('li');
        element.className = 'running';
        name = document.createElement('strong');
        name.appendChild(document.createTextNode(target.name));
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
        print("Failure: " + message + ". Expected: " + Maddy.stringify(expected) + ". Actual: " + Maddy.stringify(actual) + ".");
        break;
      case 'teardown':
        print("Finished test `" + target.name + "`. " + target.assertions + " assertions, " + target.failures + " failures.");
        break;
      case 'complete':
        print("Finished spec `" + this.name + "`. " + this.assertions + " assertions, " + this.failures + " failures.");
      }
    });
  }
  if (document != null && (typeof require != 'undefined' && require !== null)) {
    spec.add("Async Module Loader Compatibility", function(){
      var _this = this;
      return setTimeout(function(){
        return _this.equal(Associative.version, Maddy.version, "Maddy is compatible with async module loaders").done(1);
      });
    });
  }
  spec.add('isPropertyOf', function(){
    var Class;
    Class = (function(){
      Class.displayName = 'Class';
      var prototype = Class.prototype;
      function Class(){
        this.valueOf = this.toString = 1;
      }
      prototype.isPrototypeOf = prototype.hasOwnProperty = prototype.valueOf = 1;
      return Class;
    }());
    this.ok(Maddy.isPropertyOf(new Class, 'valueOf'), "The instance property `valueOf` shadows a property on the prototype");
    this.ok(Maddy.isPropertyOf(new Class, 'toString'), "The instance property `toString` shadows a property on the prototype");
    this.ok(Maddy.isPropertyOf(Class.prototype, 'hasOwnProperty'), "The prototype property `hasOwnProperty` shadows a property on `Object.prototype`");
    this.ok(Maddy.isPropertyOf(Class.prototype, 'isPrototypeOf'), "The prototype property `isPrototypeOf` shadows a property on `Object.prototype`");
    this.ok(Maddy.isPropertyOf(Class.prototype, 'valueOf'), "The prototype property `valueOf` shadows a property on `Object.prototype`");
    this.ok(Maddy.isPropertyOf(Class, 'prototype'), "The constructor property `prototype` is a direct property");
    this.ok(!Maddy.isPropertyOf(new Class, 'isPrototypeOf'), "`isPrototypeOf` is an inherited property");
    this.ok(!Maddy.isPropertyOf(new Class, 'propertyIsEnumerable'), "`propertyIsEnumerable` is an inherited property");
    this.ok(!Maddy.isPropertyOf(Class.prototype, 'toString'), "`toString` is a property inherited from `Object.prototype`");
    return this.done(9);
  });
  spec.add('getClassOf', function(){
    var _ref;
    this.equal(Maddy.getClassOf(null), 'Null', "The `[[Class]]` name of a `null` value is `Null`");
    this.equal(Maddy.getClassOf(), 'Undefined', "The `[[Class]]` name of an `undefined` value is `Undefined`");
    this.equal(Maddy.getClassOf({}), 'Object', "The `[[Class]]` name of an object literal is `Object`");
    this.equal(Maddy.getClassOf({
      length: (_ref = []).length,
      push: _ref.push,
      slice: _ref.slice
    }), 'Object', "The `[[Class]]` name of an array-like object is `Object`");
    this.equal(Maddy.getClassOf(function(){}), 'Function', "The `[[Class]]` name of a function is `Function`");
    this.equal(Maddy.getClassOf([]), 'Array', "The `[[Class]]` name of an array literal is `Array`");
    this.equal(Maddy.getClassOf(/(?:)/), 'RegExp', "The `[[Class]]` name of a RegExp is `RegExp`");
    this.equal(Maddy.getClassOf(new Date), 'Date', "The `[[Class]]` name of a `Date` instance is `Date`");
    this.equal(Maddy.getClassOf(new Error), 'Object', "The normalized `[[Class]]` of an `Error` object is `Object`");
    this.equal(Maddy.getClassOf('Kit'), 'String', "The `[[Class]]` name of a string primitive is `String`");
    this.equal(Maddy.getClassOf(new String('Maddy')), 'String', "The `[[Class]]` name of a string object is `String`");
    this.equal(Maddy.getClassOf(true), 'Boolean', "The `[[Class]]` name of a boolean primitive is `Boolean`");
    this.equal(Maddy.getClassOf(new Boolean), 'Boolean', "The `[[Class]]` name of a boolean object is `Boolean`");
    this.equal(Maddy.getClassOf(63), 'Number', "The `[[Class]]` name of a number primitive is `Number`");
    this.equal(Maddy.getClassOf(new Number(61)), 'Number', "The `[[Class]]` name of a number object is `Number`");
    return this.done(15);
  });
  spec.add('forEach', function(){
    var Class, size, result, _this = this;
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
    Maddy.forEach(new Class, function(key, value, object){
      size++;
      _this.equal(value, object[key], "The callback function accepts `key` and `value` arguments");
      return false;
    });
    this.equal(size, 1, "Explicitly returning `false` breaks the loop");
    size = 0;
    Maddy.forEach(new Class, function(key, value){
      size++;
      switch (key) {
      case 'length':
        return _this.equal(value, 1, "The direct `length` property is enumerated");
      case 'valueOf':
        return _this.equal(value, 2, "The direct `valueOf` property is enumerated");
      case 'toString':
        return _this.equal(value, 3, "The shadowed `toString` property is enumerated once");
      }
    });
    this.equal(size, 3, "The `Class` instance should contain three direct properties");
    size = 0;
    Maddy.forEach(Class.prototype, function(key, value){
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
    });
    this.equal(size, 6, "The `Class` prototype should contain six direct properties");
    result = true;
    Maddy.forEach(Class, function(it){
      if (it === 'prototype') {
        return result = false;
      }
    });
    this.ok(result, "The `prototype` property of functions should not be enumerated");
    return this.done(14);
  });
  spec.add('isEqual', function(){
    var First, Second, A, B;
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
    this.ok(!Maddy.isEqual(0, -0), "`0` is not equal to `-0`");
    this.ok(!Maddy.isEqual(-0, 0), "Commutative equality is implemented for `0` and `-0`");
    this.ok(Maddy.isEqual(null, null), "`null` is equal to `null`");
    this.ok(Maddy.isEqual(), "`undefined` is equal to `undefined`");
    this.ok(!Maddy.isEqual(null, void 8), "`null` is not equal to `undefined`");
    this.ok(!Maddy.isEqual(void 8, null), "Commutative equality is implemented for `null` and `undefined`");
    this.ok(Maddy.isEqual('Maddy', 'Maddy'), "Identical string primitives are equal");
    this.ok(Maddy.isEqual(new String('Maddy'), 'Maddy'), "String primitives and their corresponding object wrappers are equal");
    this.ok(Maddy.isEqual('Maddy', new String('Maddy')), "Commutative equality is implemented for strings");
    this.ok(Maddy.isEqual(new String('Maddy'), new String('Maddy')), "String objects with identical primitive values are equal");
    this.ok(!Maddy.isEqual(new String('Maddy'), new String('Kit')), "String objects with different primitive values are not equal");
    this.ok(!Maddy.isEqual(new String('Maddy'), 'Kit'), "String objects and primitives with different values are not equal");
    this.ok(!Maddy.isEqual(new String('Maddy'), {
      toString: function(){
        return 'Maddy';
      }
    }), "String objects and objects with a custom `toString` method are not equal");
    this.ok(Maddy.isEqual(75, 75), "Identical number primitives are equal");
    this.ok(Maddy.isEqual(75, new Number(75)), "Number primitives and their corresponding object wrappers are equal");
    this.ok(Maddy.isEqual(new Number(75), 75), "Commutative equality is implemented for numbers");
    this.ok(Maddy.isEqual(new Number(75), new Number(75)), "Number objects with identical primitive values are equal");
    this.ok(!Maddy.isEqual(new Number(75), new Number(63)), "Number objects with different primitive values are not equal");
    this.ok(!Maddy.isEqual(new Number(63), {
      valueOf: function(){
        return 63;
      }
    }), "Number objects and objects with a `valueOf` method are not equal");
    this.ok(Maddy.isEqual(NaN, NaN), "`NaN` is equal to `NaN`");
    this.ok(!Maddy.isEqual(61, NaN), "A number primitive is not equal to `NaN`");
    this.ok(!Maddy.isEqual(new Number(79), NaN), "A number object is not equal to `NaN`");
    this.ok(!Maddy.isEqual(Infinity, NaN), "`Infinity` is not equal to `NaN`");
    this.ok(Maddy.isEqual(true, true), "Identical boolean primitives are equal");
    this.ok(Maddy.isEqual(true, new Boolean(true)), "Boolean primitives and their corresponding object wrappers are equal");
    this.ok(Maddy.isEqual(new Boolean(true), true), "Commutative equality is implemented for booleans");
    this.ok(Maddy.isEqual(new Boolean, new Boolean), "Boolean objects with identical primitive values are equal");
    this.ok(!Maddy.isEqual(new Boolean(true), new Boolean), "Boolean objects with different primitive values are not equal");
    this.ok(!Maddy.isEqual(true, new Boolean(false)), "Boolean objects are not equal to the boolean primitive `true`");
    this.ok(!Maddy.isEqual("75", 75), "String and number primitives with like values are not equal");
    this.ok(!Maddy.isEqual(new Number(63), new String(63)), "String and number objects with like values are not equal");
    this.ok(!Maddy.isEqual(75, "75"), "Commutative equality is implemented for like string and number values");
    this.ok(!Maddy.isEqual(0, ""), "Number and string primitives with like values are not equal");
    this.ok(!Maddy.isEqual(1, true), "Number and boolean primitives with like values are not equal");
    this.ok(!Maddy.isEqual(new Boolean(false), new Number(0)), "Boolean and number objects with like values are not equal");
    this.ok(!Maddy.isEqual(false, new String("")), "Boolean primitives and string objects with like values are not equal");
    this.ok(!Maddy.isEqual(7732152e5, new Date(1994, 6, 3)), "Dates and their corresponding numeric primitive values are not equal");
    this.ok(Maddy.isEqual(new Date(1994, 6, 3), new Date(1994, 6, 3)), "Date objects referencing identical times are equal");
    this.ok(!Maddy.isEqual(new Date(1994, 6, 3), new Date(1993, 5, 2)), "Date objects referencing different times are not equal");
    this.ok(!Maddy.isEqual(new Date(1993, 5, 2), {
      getTime: function(){
        return 7390008e5;
      }
    }), "Date objects and objects with a `getTime` method are not equal");
    this.ok(!Maddy.isEqual(new Date('Maddy'), new Date('Maddy')), "Invalid dates are not equal");
    this.ok(!Maddy.isEqual(First, Second), "Different functions with identical bodies and source code representations are not equal");
    this.ok(Maddy.isEqual(/(?:)/gim, /(?:)/gim), "RegExps with equivalent patterns and flags are equal");
    this.ok(!Maddy.isEqual(/(?:)/g, /(?:)/gi), "RegExps with equivalent patterns and different flags are not equal");
    this.ok(!Maddy.isEqual(/Maddy/gim, /Kit/gim), "RegExps with different patterns and equivalent flags are not equal");
    this.ok(!Maddy.isEqual(/(?:)/gi, /(?:)/g), "Commutative equality is implemented for RegExps");
    this.ok(!Maddy.isEqual(/Kit/g, {
      source: 'Kit',
      global: true,
      ignoreCase: false,
      multiline: false
    }), "RegExps and RegExp-like objects are not equal");
    this.ok(Maddy.isEqual({}, {}), "Empty object literals are equal");
    this.ok(Maddy.isEqual([], []), "Empty array literals are equal");
    this.ok(Maddy.isEqual([{}], [{}]), "Empty nested arrays and objects are equal");
    this.ok(!Maddy.isEqual({}, []), "Object literals and array literals are not equal");
    this.ok(!Maddy.isEqual([], {}), "Commutative equality is implemented for objects and arrays");
    this.ok(!Maddy.isEqual({
      length: 0
    }, []), "Array-like objects and arrays are not equal");
    this.ok(!Maddy.isEqual([], {
      length: 0
    }), "Commutative equality is implemented for array-like objects");
    this.ok(Maddy.isEqual([1, 'Kit', true], [1, 'Kit', true]), "Arrays containing identical primitives are equal");
    this.ok(Maddy.isEqual([/Maddy/g, new Date(1994, 6, 3)], [/Maddy/g, new Date(1994, 6, 3)]), "Arrays containing equivalent elements are equal");
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
    this.ok(Maddy.isEqual(A, B), "Arrays containing nested arrays and objects are recursively compared");
    A.forEach = A.map = A.filter = A.every = A.indexOf = A.lastIndexOf = A.some = A.reduce = A.reduceRight = null;
    B.join = B.pop = B.reverse = B.shift = B.slice = B.splice = B.concat = B.sort = B.unshift = null;
    this.ok(Maddy.isEqual(A, B), "Arrays containing equivalent elements and different non-numeric properties are equal");
    A.push("White Rocks");
    this.ok(!Maddy.isEqual(A, B), "Arrays of different lengths are not equal");
    A.push("East Boulder");
    B.push("Gunbarrel Ranch", "Teller Farm");
    this.ok(!Maddy.isEqual(A, B), "Arrays of identical lengths containing different elements are not equal");
    this.ok(Maddy.isEqual(Array(3), Array(3)), "Sparse arrays of identical lengths are equal");
    this.ok(!Maddy.isEqual(Array(3), Array(6)), "Sparse arrays of different lengths are not equal");
    if (0 in [void 8]) {
      this.ok(!Maddy.isEqual(Array(3), [void 8, void 8, void 8]), "Sparse and dense arrays are not equal");
      this.ok(!Maddy.isEqual([void 8, void 8, void 8], Array(3)), "Commutative equality is implemented for sparse and dense arrays");
    }
    this.ok(Maddy.isEqual({
      a: 'Maddy',
      b: 1,
      c: true
    }, {
      a: 'Maddy',
      b: 1,
      c: true
    }), "Objects containing identical primitives are equal");
    this.ok(Maddy.isEqual({
      a: /Kit/g,
      b: new Date(1993, 5, 2)
    }, {
      a: /Kit/g,
      b: new Date(1993, 5, 2)
    }), "Objects containing equivalent members are equal");
    this.ok(!Maddy.isEqual({
      a: 63,
      b: 75
    }, {
      a: 61,
      b: 55
    }), "Objects of identical sizes with different values are not equal");
    this.ok(!Maddy.isEqual({
      a: 63,
      b: 75
    }, {
      a: 61,
      c: 55
    }), "Objects of identical sizes with different property names are not equal");
    this.ok(!Maddy.isEqual({
      a: 1,
      b: 2
    }, {
      a: 1
    }), "Objects of different sizes are not equal");
    this.ok(!Maddy.isEqual({
      a: 1
    }, {
      a: 1,
      b: 2
    }), "Commutative equality is implemented for objects");
    this.ok(!Maddy.isEqual({
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
    this.ok(Maddy.isEqual(A, B), "Objects with nested equivalent members are recursively compared");
    A.constructor = A.hasOwnProperty = A.isPrototypeOf = A.propertyIsEnumerable = A.toString = A.toLocaleString = A.valueOf = null;
    B.constructor = B.hasOwnProperty = B.isPrototypeOf = B.propertyIsEnumerable = null;
    this.ok(!Maddy.isEqual(A, B), "Objects with different own properties are not equal");
    B.toString = B.toLocaleString = B.valueOf = null;
    this.ok(Maddy.isEqual(A, B), "Objects with identical own properties are equal");
    this.ok(Maddy.isEqual(new First, new First), "Object instances are equal");
    this.ok(Maddy.isEqual(new First, new Second), "Objects with different constructors and identical own properties are equal");
    this.ok(Maddy.isEqual({
      toString: new Number(1)
    }, new First), "Object instances and objects sharing equivalent properties are identical");
    this.ok(!Maddy.isEqual({
      toString: 2
    }, new Second), "The prototype chain of objects should not be examined");
    (A = []).push(A);
    (B = []).push(B);
    this.ok(Maddy.isEqual(A, B), "Arrays containing circular references are equal");
    A.push(new String('Kit'));
    B.push('Kit');
    this.ok(Maddy.isEqual(A, B), "Arrays containing circular references and equivalent properties are equal");
    A.push('John-David');
    B.push(new String('Maddy'));
    this.ok(!Maddy.isEqual(A, B), "Arrays containing circular references and different properties are not equal");
    A = {
      abc: null
    };
    B = {
      abc: null
    };
    A.abc = A;
    B.abc = B;
    this.ok(Maddy.isEqual(A, B), "Objects containing circular references are equal");
    A.def = new Number(75);
    B.def = 75;
    this.ok(Maddy.isEqual(A, B), "Objects containing circular references and equivalent properties are equal");
    A.def = 75;
    B.def = new Number(63);
    this.ok(!Maddy.isEqual(A, B), "Objects containing circular references and different properties are not equal");
    A = [{
      abc: null
    }];
    B = [{
      abc: null
    }];
    (A[0].abc = A).push(A);
    (B[0].abc = B).push(B);
    this.ok(Maddy.isEqual(A, B), "Cyclic structures are equal");
    A[0].def = new String('Kit');
    B[0].def = 'Kit';
    this.ok(Maddy.isEqual(A, B), "Cyclic structures containing equivalent properties are equal");
    A[0].def = 'Kit';
    B[0].def = new String('Maddy');
    this.ok(!Maddy.isEqual(A, B), "Cyclic structures containing different properties are not equal");
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
    this.ok(Maddy.isEqual(A, B), "Cyclic structures with nested and identically-named properties are equal");
    return this.done();
  });
  spec.add('stringify', function(){
    var A, cyclic;
    this.equal(Maddy.stringify(null), 'null', "`null` is serialized as-is");
    this.equal(Maddy.stringify(), 'null', "`undefined` values are converted to `null`");
    this.equal(Maddy.stringify(Infinity), 'null', "`Infinity` is converted to `null`");
    this.equal(Maddy.stringify(NaN), 'null', "`NaN` is converted to `null`");
    this.equal(Maddy.stringify(function(){}), 'null', "Functions are converted to `null`");
    this.equal(Maddy.stringify(/Kit/), "{\"source\": \"Kit\", \"global\": false, \"ignoreCase\": false, \"multiline\": false}", "RegExps are serialized as standard objects");
    this.equal(Maddy.stringify(/Maddy/gi), "{\"source\": \"Maddy\", \"global\": true, \"ignoreCase\": true, \"multiline\": false}", "RegExp flags set the corresponding properties accordingly");
    this.equal(Maddy.stringify(true), 'true', "`true` is serialized as-is");
    this.equal(Maddy.stringify(new Boolean(false)), 'false', "`false` is serialized as-is");
    this.equal(Maddy.stringify('Kit'), '"Kit"', "String values are double-quoted");
    this.equal(Maddy.stringify(new String('\\"Hello\bworld\tthis\nis\fnice\r"')), '"\\\\\\"Hello\\bworld\\tthis\\nis\\fnice\\r\\""', "All control characters are escaped");
    this.equal(Maddy.stringify(new Date(1994, 6, 3)), '"1994-07-03T06:00:00.000Z"', "Dates are serialized using the simplified date time string format");
    this.equal(Maddy.stringify(new Date(1993, 5, 2, 2, 10, 28, 224)), '"1993-06-02T08:10:28.224Z"', "The date time string conforms to the format outlined in the spec");
    this.equal(Maddy.stringify([new Boolean, new Number(1), new String('Maddy')]), "[false, 1, \"Maddy\"]", "Arrays are recursively serialized");
    (A = []).push(1, A, 2, A, 3, A);
    this.equal(Maddy.stringify(A), "[1, null, 2, null, 3, null]", "Circular array references are replaced with `null`");
    this.equal(Maddy.stringify({
      jdalton: 'John-David',
      kitcam: 'Kit',
      M_J: 'Maddy'
    }), "{\"jdalton\": \"John-David\", \"kitcam\": \"Kit\", \"M_J\": \"Maddy\"}", "Objects are recursively serialized");
    (A = {
      def: null
    }).def = A;
    this.equal(Maddy.stringify(A), "{\"def\": null}", "Circular object references are replaced with `null`");
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
    this.equal(Maddy.stringify(cyclic), "{\"foo\": {\"b\": {\"foo\": {\"c\": {\"foo\": null}}}}}", "Complex circular references are serialized correctly");
    return this.done(18);
  });
  spec.add("map, collect", function(){
    var developers, callback;
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
    this.error(function(){
      return Maddy.map(null);
    }, /TypeError/, "`map` throws a `TypeError` if the callback function is omitted");
    callback = function(key, value){
      return [value['name'], value['age']];
    };
    this.deepEqual(Maddy.map(developers, callback), {
      jdalton: ['John-David', 29],
      mathias: ['Mathias', 23],
      kitcam: ['Kit', 18]
    }, "`map` can transform the values of an object");
    callback = function(key, value){
      return [key, value.age * this.K];
    };
    this.deepEqual(Maddy.collect(developers, callback, {
      K: 10
    }), {
      jdalton: ['jdalton', 290],
      mathias: ['mathias', 230],
      kitcam: ['kitcam', 180]
    }, "`collect` accepts a `context` argument");
    return this.done(3);
  });
  spec.add("fold, inject, reduce", function(){
    var ages, callback;
    ages = {
      jdalton: 29,
      mathias: 23,
      M_J: 17
    };
    callback = function(memo, name, age){
      return memo + age;
    };
    this.error(function(){
      return Maddy.fold(ages);
    }, /TypeError/, "`fold` throws a `TypeError` if the callback function is omitted");
    this.error(function(){
      return Maddy.fold(ages, callback);
    }, /TypeError/, "`fold` throws a `TypeError` if the initial value is omitted");
    this.equal(Maddy.inject(ages, callback, 0), 69, "`inject` can sum the numeric values of an object");
    callback = function(memo, name, age){
      memo[age * this.K] = name;
      return memo;
    };
    this.deepEqual(Maddy.reduce(ages, callback, {}, {
      K: 10
    }), {
      290: 'jdalton',
      230: 'mathias',
      170: 'M_J'
    }, "`reduce` accepts a `context` argument");
    return this.done(4);
  });
  spec.add("some, any", function(){
    var languages;
    languages = {
      JavaScript: 1996,
      Haskell: 1990,
      Perl: 1987,
      Python: 1991,
      Ruby: 1993
    };
    this.ok(!Maddy.some({}, Maddy.identity(1)), "`some` returns `false` for an empty object");
    this.ok(!Maddy.any({
      Kit: false,
      Mathias: false,
      Maddy: false
    }, Maddy.identity(1)), "`any` returns `false` for an object containing all falsy values");
    this.ok(Maddy.some({
      Kit: false,
      Mathias: false,
      Maddy: true
    }, Maddy.identity(1)), "`some` returns `true` for an object containing at least one truthy value");
    this.ok(Maddy.any(languages, function(key, value){
      return key > "Delphi" && value > 1990;
    }), "`any` returns `true` if the object contains at least one matching member");
    this.ok(!Maddy.any(languages, function(key, value){
      return key > "Visual Basic";
    }), "`any` returns `false` if no matching members are found");
    return this.done(5);
  });
  spec.add("select, findAll, filter", function(){
    var libraries;
    libraries = {
      Prototype: 2005,
      jQuery: 2006,
      MooTools: 2006,
      YUI: 2005,
      Underscore: 2009
    };
    this.deepEqual(Maddy.select(libraries, function(library, year){
      return year > 2004;
    }), libraries, "`select` returns a shallow copy if all members match the specified criteria");
    this.deepEqual(Maddy.findAll(libraries, function(library){
      return library < "Dojo";
    }), {}, "`findAll` returns an empty set if no matching members are found");
    this.deepEqual(Maddy.filter(libraries, function(library, year){
      return library > "Sencha" && year > 2007;
    }), {
      Underscore: 2009
    }, "`filter returns a set of members that match the specified criteria");
    return this.done(3);
  });
  spec.add("all, every", function(){
    var languages;
    languages = {
      JavaScript: 1996,
      Haskell: 1990,
      Perl: 1987,
      Python: 1991,
      Ruby: 1993
    };
    this.ok(Maddy.all({}, Maddy.identity(1)), "`all` is vacuously true for an empty object");
    this.ok(Maddy.every({
      Kit: true,
      Mathias: true,
      Maddy: true
    }, Maddy.identity(1)), "`every` returns `true` for an object containing all truthy values");
    this.ok(!Maddy.all({
      Kit: true,
      Mathias: false,
      Maddy: true
    }, Maddy.identity(1)), "`all` returns `false` for an object containing one or more falsy values");
    this.ok(!Maddy.every(languages, function(key, value){
      return key > "Delphi" && value > 1990;
    }), "`every` returns `false` if one or more members do not match");
    this.ok(Maddy.all(languages, function(key, value){
      return key < "Visual Basic";
    }), "`all` returns `true` only if all members match the criteria");
    return this.done(5);
  });
  spec.add('reject', function(){
    var libraries;
    libraries = {
      Prototype: 2005,
      jQuery: 2006,
      MooTools: 2006,
      YUI: 2005,
      Underscore: 2009
    };
    this.deepEqual(Maddy.reject(libraries, function(library){
      return library > "Backbone";
    }), {}, "`reject` returns an empty set if all members match the specified criteria");
    this.deepEqual(Maddy.reject(libraries, function(library, year){
      return library < "Qooxdoo" || year < 2006;
    }), {
      jQuery: 2006,
      Underscore: 2009
    }, "`reject` returns a set of members that do not match the specified criteria");
    this.deepEqual(Maddy.reject(libraries, function(library, year){
      return year > 2009;
    }), libraries, "`reject` returns a shallow copy if no members match the specified criteria");
    return this.done(3);
  });
  spec.add("invoke, send", function(){
    var names;
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
    this.deepEqual(Maddy.send(names, 'pop'), {
      jdalton: 'programmer',
      kitcam: 'programmer',
      M_J: 'runner'
    }, "`send` invokes a method on every member value");
    this.deepEqual(Maddy.invoke(names, 'slice', 1, -1), {
      jdalton: [29],
      kitcam: [18],
      M_J: [17]
    }, "`invoke` accepts optional arguments for each method");
    return this.done(2);
  });
  spec.add('max', function(){
    var names;
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
    this.equal(Maddy.max(names, function(name, _arg){
      var age;
      age = _arg.age;
      return age;
    }), 'jdalton', "`max` returns the maximum member value as computed by the callback function");
    return this.done(1);
  });
  spec.add('min', function(){
    var names;
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
    this.equal(Maddy.min(names, function(name, _arg){
      var age;
      age = _arg.age;
      return age;
    }), 'M_J', "`min` returns the minimum member value as computed by the callback function");
    return this.done(1);
  });
  spec.add('partition', function(){
    var names, results;
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
    this.deepEqual(Maddy.partition(names, function(user, name){
      return name.length > 13;
    }), results, "`partition` separates object members using the criteria specified by the callback");
    return this.done(1);
  });
  spec.add('groupBy', function(){
    var guests, groups;
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
    this.deepEqual(Maddy.groupBy(guests, function(name, food){
      return food;
    }), groups, "`groupBy` groups members using the criteria specified by the callback");
    return this.done(1);
  });
  spec.add('keys', function(){
    var exception, sparse, names;
    exception = /TypeError/;
    sparse = Array(10);
    names = {
      jdalton: 'John-David',
      mathias: 'Mathias',
      M_J: 'Maddy'
    };
    this.deepEqual(Maddy.keys(names), ['jdalton', 'mathias', 'M_J'], "`keys` should return an array of direct property names");
    sparse.push(1);
    this.deepEqual(Maddy.keys(sparse), ['10'], "A sparse array should contain only one key");
    this.error(function(){
      return Maddy.keys(null);
    }, exception, "`null` should throw a `TypeError");
    this.error(function(){
      return Maddy.keys();
    }, exception, "`undefined` should throw a `TypeError");
    this.error(function(){
      return Maddy.keys(1);
    }, exception, "`Number primitives should throw a `TypeError");
    this.error(function(){
      return Maddy.keys('Maddy');
    }, exception, "String primitives should throw a `TypeError");
    this.error(function(){
      return Maddy.keys(true);
    }, exception, "Boolean primitives should throw a `TypeError");
    return this.done(7);
  });
  spec.add('values', function(){
    var runners;
    runners = {
      kitcam: 'Kit',
      M_J: 'Maddy'
    };
    this.deepEqual(Maddy.values(runners), ['Kit', 'Maddy'], "`values` should return an array of direct property values");
    return this.done(1);
  });
  spec.add('extend', function(){
    this.deepEqual(Maddy.extend({}, {
      a: 'b'
    }), {
      a: 'b'
    }, "`extend` can copy source properties to the target object");
    this.deepEqual(Maddy.extend({
      a: 'x'
    }, {
      a: 'b'
    }), {
      a: 'b'
    }, "Non-unique source properties should overwrite destination properties");
    this.deepEqual(Maddy.extend({
      x: 'x'
    }, {
      a: 'b'
    }), {
      x: 'x',
      a: 'b'
    }, "Unique source properties should be copied to the target object");
    this.deepEqual(Maddy.extend({
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
  });
  spec.add('isEmpty', function(){
    var Class, kit;
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
    this.ok(Maddy.isEmpty(null), "`null` is empty");
    this.ok(Maddy.isEmpty(), "`undefined` is empty");
    this.ok(Maddy.isEmpty([]), "Empty array");
    this.ok(Maddy.isEmpty({}), "Empty object literal");
    this.ok(Maddy.isEmpty(new Class), "Empty object instance");
    this.ok(Maddy.isEmpty(""), "Zero-length string primitive");
    this.ok(Maddy.isEmpty(new String), "Zero-length string object");
    this.ok(Maddy.isEmpty(/(?:)/), "Empty RegExp");
    this.ok(!Maddy.isEmpty('John-David'), "Non-empty string primitive");
    this.ok(!Maddy.isEmpty(/Maddy/), "Non-empty RegExp");
    this.ok(!Maddy.isEmpty(new Date), "Date object");
    this.ok(!Maddy.isEmpty(false), "Boolean primitive");
    this.ok(!Maddy.isEmpty([1]), "Array with one element");
    this.ok(!Maddy.isEmpty(kit), "Object literal with one member");
    delete kit.kitcam;
    this.ok(Maddy.isEmpty(kit), "Removing all direct properties from an object should empty it");
    return this.done(15);
  });
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
