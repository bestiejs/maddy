/*!
 * Maddy object operations library
 * http://github.com/kitcambridge/maddy
 *
 * Copyright 2011, Kit Cambridge
 * http://kitcambridge.github.com
 *
 * Released under the MIT License.
*/

(function (root, Maddy) {
  if (typeof define == "function" && typeof define["amd"] == "object" && define["amd"]) {
    // Export Maddy for asynchronous module loaders (e.g., RequireJS, `curl.js`).
    define(["exports"], Maddy);
  } else {
    // Export for CommonJS environments, web browsers, and JavaScript engines.
    Maddy = Maddy(typeof exports == "object" && exports || (root["Maddy"] = {
      // **noConflict** restores the original value of the `Maddy` variable and returns a
      // reference to the Maddy object.
      "noConflict": (function (original) {
        function noConflict() {
          root["Maddy"] = original;
          return Maddy;
        }
        return noConflict;
      })(root["Maddy"])
    }));
  }
})(this, function (exports) {
  // The current version of Maddy.
  exports.version = "0.2.0";

  // `Object#toString` returns a string containing the internal `[[Class]]` name of an object.
  // `Function.apply` and `Array.slice` are cached for performance. `Infinity` and `nil` are
  // aliased for minification.
  var toString = {}.toString, apply = toString.apply, slice = [].slice, Infinity = 1 / 0, nil = null,

  // **isPropertyOf** determines if an object contains a property as a direct property.
  isPropertyOf = exports["isPropertyOf"] = (function () {
    // `Object.hasOwnProperty` is specified in section 15.2.4.5 of the ES 5.1 spec, but isn"t
    // implemented in Safari 2.0.3 and older.
    var memo = {}, hasOwnProperty = memo.hasOwnProperty, isPropertyOf;

    if (toString.call(hasOwnProperty) == "[object Function]") {
      // Wrap `Object.hasOwnProperty` in conforming implementations.
      isPropertyOf = function isPropertyOf(object, property) {
        if (object !== Object(object)) {
          throw new TypeError("Invalid argument.");
        }
        return hasOwnProperty.call(object, property);
      };
    } else if (memo.__proto__ = nil, !("toString" in memo)) {
      // Safari 2 exposes the value of an object"s internal `[[Prototype]]` property as `__proto__`.
      // Breaking the object"s `[[Prototype]]` chain removes all its inherited properties.
      isPropertyOf = function isPropertyOf(object, property) {
        var original, result;
        if (object !== Object(object)) {
          throw new TypeError("Invalid argument.");
        }
        // Capture and break the object"s `[[Prototype]]` chain. See See ES 5.1 section 8.6.2.
        original = object.__proto__;
        // The parenthesized expression is necessary to prevent an unsafe transformation by the
        // Closure Compiler.
        result = property in (object.__proto__ = nil, object);
        // Restore the `[[Prototype]]` chain.
        object.__proto__ = original;
        return result;
      };
    } else {
      // Use the `constructor` property to approximate `Object.hasOwnProperty` in environments that
      // don"t expose the prototype chain.
      isPropertyOf = function isPropertyOf(object, property) {
        if (object !== Object(object)) {
          throw new TypeError("Invalid argument.");
        }
        var parent = (object.constructor || Object).prototype;
        return property in object && !(property in parent && object[property] === parent[property]);
      };
    }
    return isPropertyOf;
  })(),

  // **getClassOf** returns the `[[Class]]` name of an object.
  getClassOf = exports["getClassOf"] = (function () {
    function getClassOf(object) {
      var className;
      // `Null` and `Undefined` are not formal `[[Class]]` names.
      if (object === nil) {
        return "Null";
      }
      // Quickly look up the `[[Class]]` names of primitive types.
      className = typeof object;
      if (isPropertyOf(classNames, className)) {
        return classNames[className];
      }
      // Look up the `[[Class]]` names of objects using `Object#toString`. `"Object"` is used as the
      // default if the `[[Class]]` name is not specified in the map.
      className = toString.call(object);
      return isPropertyOf(classNames, className) ? classNames[className] : "Object";
    }

    // An internal `[[Class]]` map used by `getClassOf`. See the ECMAScript spec, section 15.2.4.2.
    var classNames = {
      "undefined": "Undefined",
      "[object Function]": "Function",
      "[object Array]": "Array",
      "[object Date]": "Date",
      "[object RegExp]": "RegExp"
    };

    // The values returned by the `typeof` operator for boolean, string, and number primitives are
    // stored in the `[[Class]]` map along with their corresponding `Object#toString` equivalents for
    // object wrappers.
    classNames["string"] = classNames["[object String]"] = "String";
    classNames["boolean"] = classNames["[object Boolean]"] = "Boolean";
    classNames["number"] = classNames["[object Number]"] = "Number";

    return getClassOf;
  })(),

  // **forEach** executes an callback function once per object member. The iteration algorithm is
  // normalized to account for cross-environment inconsistencies. Based on work by John-David
  // Dalton, Asen Bozhilov, and Juriy Zaytsev.
  forEach = exports["forEach"] = (function () {

    // The `Properties` constructor tests for bugs in the current environment"s `for...in`
    // algorithm.
    function Properties() {
      // The `valueOf` property inherits the non-enumerable flag from `Object.prototype` in JScript.
      // Properties that shadow those in the prototype chain are enumerated twice in Safari 2.
      this.valueOf = 0;
    }

    // Iterate over a new instance of the `Properties` constructor to detect inconsistencies in the
    // `for...in` algorithm.
    var size = Properties.prototype.valueOf = 0, properties = new Properties, property, forEach;
    for (property in properties) {
      // Ignore all other properties inherited from `Object.prototype`.
      if (isPropertyOf(properties, property)) {
        size++;
      }
    }

    // Normalize the iteration algorithm.
    if (!size) {
      // A list of non-enumerable properties inherited from `Object.prototype`.
      properties = ["constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf"];
      // JScript ignores shadowed non-enumerable properties.
      forEach = function forEach(callback, context, object) {
        var index, property;
        // The `context` argument is optional.
        if (arguments.length < 3) {
          object = context;
          context = nil;
        }
        if (object !== Object(object)) {
          throw new TypeError("Invalid argument.");
        }
        for (property in object) {
          // Break if the callback function explicitly returns `false`.
          if (isPropertyOf(object, property) && callback.call(context, property, object[property], object) === false) {
            return;
          }
        }
        // Manually invoke the callback for each non-enumerable property.
        for (index = 0; property = properties[index++];) {
          if (isPropertyOf(object, property) && callback.call(context, property, object[property], object) === false) {
            break;
          }
        }
      };
    } else if (size == 2) {
      // Safari 2 enumerates shadowed properties twice.
      // See http://web.archive.org/http://tobielangel.com/2007/1/29/for-in-loop-broken-in-safari.
      forEach = function forEach(callback, context, object) {
        var properties, isFunction, property;
        if (arguments.length < 3) {
          object = context;
          context = nil;
        }
        if (object !== Object(object)) {
          throw new TypeError("Invalid argument.");
        }
        // Create a map of iterated properties.
        properties = {};
        // Skip the `prototype` property of functions due to cross-environment inconsistencies.
        isFunction = getClassOf(object) == "Function";
        for (property in object) {
          // Store each property name to prevent double enumeration.
          if (!(isFunction && property == "prototype") && !isPropertyOf(properties, property) && (properties[property] = 1) && isPropertyOf(object, property) && callback.call(context, property, object[property], object) === false) {
            break;
          }
        }
      };
    } else {
      // No bugs detected; use the standard `for...in` algorithm.
      forEach = function forEach(callback, context, object) {
        var isFunction, property, isConstructor;
        if (arguments.length < 3) {
          object = context;
          context = nil;
        }
        if (object !== Object(object)) {
          throw new TypeError("Invalid argument.");
        }
        isFunction = getClassOf(object) == "Function";
        for (property in object) {
          if (!(isFunction && property == "prototype") && isPropertyOf(object, property) && !(isConstructor = property == "constructor") && callback.call(context, property, object[property], object) === false) {
            return;
          }
        }
        // Manually invoke the callback for the `constructor` property due to cross-environment
        // inconsistencies.
        if (isConstructor || isPropertyOf(object, "constructor")) {
          callback.call(context, "constructor", object.constructor, object);
        }
      };
    }

    return forEach;
  })(),

  // **isEqual** recursively compares two objects for equivalence.
  isEqual = exports["isEqual"] = (function () {
    function equals(left, right) {
      return eq(left, right, []);
    }

    // Comparison algorithm derived from work by Jeremy Ashkenas and Philippe Rathe.
    function eq(left, right, stack) {
      var className, result, size;
      // Identical objects are equivalent.
      if (left === right) {
        // `0 === -0`, but they aren"t equivalent. See the ECMAScript Harmony `egal` proposal.
        return left !== 0 || 1 / left == 1 / right;
      }
      // Compare `[[Class]]` names.
      className = getClassOf(left);
      if (className != getClassOf(right)) {
        return false;
      }
      switch (className) {
        // `null` and `undefined` are compared by identity.
        case "Null":
        case "Undefined":
          return left == right;
        // Strings, numbers, dates, and booleans are compared by value.
        case "String":
          // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
          // equivalent to `new String("5")`.
          return String(left) == String(right);
        case "Number":
        case "Boolean":
          // Coerce numbers, dates, and booleans to numeric primitive values.
          left = +left;
          right = +right;
          // `NaN`s are equivalent, but non-reflexive.
          return left != left ? right != right : left == right;
        case "Date":
          // Compare dates by their millisecond representations. Invalid dates
          // are not equivalent.
          return +left == +right;
        // RegExps are compared by their source patterns and flags.
        case "RegExp":
          return left.source == right.source && left.global == right.global && left.multiline == right.multiline && left.ignoreCase == right.ignoreCase;
      }
      // All values apart from objects...
      if (typeof left != "object") {
        return false;
      }
      // Assume equality for cyclic structures. The algorithm for detecting cyclic structures is
      // adapted from ES 5.1 section 15.12.3, abstract operation `JO`.
      for (size = stack.length; size--;) {
        // This is a simple linear search; thus, performance is inversely proportional to the number
        // of unique nested structures.
        if (stack[size] == left) {
          return true;
        }
      }
      // Add the object to the stack of traversed objects.
      stack.push(left);
      result = true;
      size = 0;
      // Recursively compare objects and arrays.
      if (className == "Array") {
        // Compare array lengths to determine if a deep comparison is necessary.
        size = left.length;
        result = size == right.length;
        if (result) {
          // Deep compare the contents, ignoring non-numeric properties.
          while (size--) {
            // Ensure commutative equality for sparse arrays.
            if (!(result = size in left == size in right && eq(left[size], right[size], stack))) {
              break;
            }
          }
        }
      } else {
        result = all(function (key, value) {
          // Count the expected number of properties.
          size++;
          // Deep compare each own object member.
          return isPropertyOf(right, key) && eq(value, right[key], stack);
        }, left);
        // Ensure that both objects contain the same number of properties.
        if (result) {
          all(function () {
            return size--;
          }, right);
          result = !size;
        }
      }
      // Remove the object from the traversed object stack.
      stack.pop();
      return result;
    }

    return equals;
  })(),

  // **stringify** returns a JSON representation of an object. This method is similar to
  // `JSON.stringify`, but provides its own implementation of the date time string serialization
  // algorithm and works with cyclic structures. All invalid JSON values, such as functions and
  // `undefined` values, are represented as `"null"`. Custom `toJSON` methods are ignored.
  stringify = exports["stringify"] = (function () {
    function stringify(object) {
      return serialize(object, []);
    }

    // Converts `value` into a zero-padded string such that its length is at least equal to `width`.
    function toPaddedString(width, value) {
      value = String(value);
      // `width < 5` only. For arbitrary `width` values, use `Array(width).join("0")`.
      return ("0000" + value).slice(-width);
    }

    // A map of escape sequences for control characters.
    var escapes = {
      "\b": "\\b",
      "\t": "\\t",
      "\n": "\\n",
      "\f": "\\f",
      "\r": "\\r",
      "\"": "\\\"",
      "\\": "\\\\"
    },
    // `escapable` matches control characters, double quotes, and the escape character.
    escapable = /[\x00-\x1f"\\]/g, charCode = 32, escape;

    // Populate the escape sequences map with the corresponding control characters.
    for (; charCode--; escape = String.fromCharCode(charCode)) {
      if (!escapes[escape]) {
        escapes[escape] = "\\u" + toPaddedString(4, charCode.toString(16));
      }
    }

    // `quote` replaces an ASCII control character with its corresponding escape sequence.
    function quote(value) {
      value = String(value);
      // Walk the input string.
      for (var result = "\"", lastIndex = escapable.lastIndex = 0, index, match; match = escapable.exec(value);) {
        // Append the escape sequence and update the RegExp"s `lastIndex` property.
        result += value.slice(lastIndex, index = match.index) + escapes[match = match[0]];
        lastIndex = escapable.lastIndex = index + match.length;
      }
      // Append the remainder of the input string.
      if (lastIndex < value.length) {
        result += value.slice(lastIndex);
      }
      return result + "\"";
    }

    // `serialize` recursively serializes an object.
    function serialize(value, stack) {
      var className = getClassOf(value), length, element, result;
      switch (className) {
        case "Number":
        case "Boolean":
          // JSON numbers must be finite. `Infinity` and `NaN` are converted to `"null"`.
          return isEmpty(value) ? "null" : String(value);
        case "String":
          // Strings are double-quoted and escaped.
          return quote(value);
        case "Date":
          if (isEmpty(value)) {
            return "null";
          }
          // Dates are serialized according to the `Date.toJSON` method specified in ES 5.1 section
          // 15.9.5.44. See section 15.9.1.15 for the ISO 8601 date time string format.
          return "\"" + value.getUTCFullYear() + "-" + toPaddedString(2, value.getUTCMonth() + 1) + "-" + toPaddedString(2, value.getUTCDate()) +
            // Months, dates, hours, minutes, and seconds should have two digits; milliseconds should have three.
            "T" + toPaddedString(2, value.getUTCHours()) + ":" + toPaddedString(2, value.getUTCMinutes()) + ":" + toPaddedString(2, value.getUTCSeconds()) +
            // Milliseconds are optional in ES 5.0, but required in 5.1.
            "." + toPaddedString(3, value.getUTCMilliseconds()) + "Z\"";
        case "RegExp":
          return "{\"source\": " + quote(value.source) + ", \"global\": " + value.global + ", \"ignoreCase\": " + value.ignoreCase + ", \"multiline\": " + value.multiline + "}";
      }
      // Recursively serialize objects and arrays.
      if (typeof value == "object" && value) {
        // ES 5.1 section 15.12.3 dictates that JSON structures must be acyclic. `stringify`
        // replaces all circular references with `"null"`.
        for (length = stack.length; length--;) {
          if (stack[length] == value) {
            return "null";
          }
        }
        // Add the object to the stack of traversed objects.
        stack.push(value);
        if (className == "Array") {
          result = [];
          // Recursively serialize array elements.
          for (length = value.length; length--;) {
            if (length in value) {
              result[length] = serialize(value[length], stack);
            }
          }
          return "[" + result.join(", ") + "]";
        } else {
          return "{" + fold(function (result, key, value) {
            // Recursively serialize object members.
            return result.push(quote(key) + ": " + serialize(value, stack)), result;
          }, [], value).join(", ") + "}";
        }
        // Remove the object from the traversed object stack.
        stack.pop();
      }
      return "null";
    }

    return stringify;
  })();

  // **isEmpty** checks if the provided object is empty.
  exports["isEmpty"] = isEmpty;
  function isEmpty(value) {
    var className = getClassOf(value);
    switch (className) {
      case "Null":
      case "Undefined":
        return true;
      case "Number":
      case "Date":
        // Numbers and dates with indeterminate numeric primitive values are empty.
        value = +value;
        return value != value || value == Infinity || value == -Infinity;
      case "Boolean":
      case "Function":
        return false;
      case "RegExp":
        return value.source == "(?:)";
      case "String":
      case "Array":
        return !value.length;
      default:
        return all(function () {
          return false;
        }, value);
    }
  }

  // **keys** returns an array containing an object"s member names.
  exports["keys"] = keys;
  function keys(object) {
    return fold(function (results, key) {
      return results.push(key), results;
    }, [], object);
  }

  // **values** returns an array containing an object"s member values.
  exports["values"] = values;
  function values(object) {
    return fold(function (results, key, value) {
      return results.push(value), results;
    }, [], object);
  }

  // **extend** extends an object with the properties of one or more provided objects.
  exports["extend"] = extend;
  function extend(destination) {
    var index = 1, length = arguments.length;
    // Copies each property to the destination object.
    function callback(key, value) {
      destination[key] = value;
    }
    for (; index < length; index++) {
      forEach(callback, arguments[index]);
    }
    return destination;
  }

  // **map** returns an object containing the results of invoking a function on each object member.
  // Aliased as **collect**.
  exports["map"] = exports["collect"] = map;
  function map(callback, context, object) {
    if (arguments.length < 3) {
      object = context;
      context = nil;
    }
    return fold(function (results, key, value, object) {
      return results[key] = callback.call(context, key, value, object), results;
    }, {}, object);
  }

  // **fold** builds a return value using the successive results of the callback, as to reduce the
  // object to a single value. Aliased as **inject** and **reduce**.
  exports["fold"] = exports["inject"] = exports["reduce"] = fold;
  function fold(callback, context, memo, object) {
    var length = arguments.length;
    if (length < 3) {
      throw new TypeError("Invalid argument.");
    }
    if (length == 3) {
      object = memo;
      memo = context;
      // Assume that the optional `context` argument was omitted.
      context = nil;
    }
    forEach(function (key, value, object) {
      return memo = callback.call(context, memo, key, value, object);
    }, object);
    return memo;
  }

  // **some** determines if the callback returns a truthy value for at least one object member.
  // Aliased as **any**.
  exports["some"] = exports["any"] = some;
  function some(callback, context, object) {
    var result = false;
    if (arguments.length < 3) {
      object = context;
      context = nil;
    }
    forEach(function (key, value, object) {
      return !(result = !!callback.call(context, key, value, object));
    }, object);
    return result;
  }

  // **select** returns an object containing all object members for which the callback returns
  // a truthy value. Aliased as **findAll** and **filter**; **reject** is the opposite of this
  // method.
  exports["select"] = exports["findAll"] = exports["filter"] = select;
  function select(callback, context, object) {
    if (arguments.length < 3) {
      object = context;
      context = nil;
    }
    return fold(function (memo, key, value, object) {
      return callback.call(context, key, value, object) && (memo[key] = value), memo;
    }, {}, object);
  }

  // **invoke** invokes a method with optional arguments on every member value. `invoke` does not
  // directly mutate the original object; however, the object *may* be mutated by the method call.
  // Aliased as **send**.
  exports["invoke"] = exports["send"] = invoke;
  function invoke(object, method) {
    var parameters = slice.call(arguments, 2);
    return map(function (key, value) {
      return apply.call(value[method], value, parameters);
    }, object);
  }

  // **all** determines whether the callback returns a truthy value for all object members. Aliased
  // as **every**.
  exports["all"] = exports["every"] = all;
  function all(callback, context, object) {
    var result = true;
    // ...
    if (arguments.length < 3) {
      object = context;
      context = nil;
    }
    forEach(function (key, value, object) {
      return result = !!callback.call(context, key, value, object);
    }, object);
    return result;
  }

  // **reject** returns an object containing all object members and values for which the callback
  // returns a falsy value. `filter` is the opposite of this method.
  exports["reject"] = reject;
  function reject(callback, context, object) {
    if (arguments.length < 3) {
      object = context;
      context = nil;
    }
    return fold(function (memo, key, value, object) {
      return !callback.call(context, key, value, object) && (memo[key] = value), memo;
    }, {}, object);
  }

  // **max** returns the key of the maximum member value, or member-based computation. Member values
  // are compared by applying the callback and comparing returned values.
  exports["max"] = max;
  function max(callback, context, object) {
    var result;
    if (arguments.length < 3) {
      object = context;
      context = nil;
    }
    fold(function (memo, key, value, object) {
      var criteria = callback.call(context, key, value, object);
      if (criteria > memo) {
        memo = criteria;
        result = key;
      }
      return memo;
    }, -Infinity, object);
    return result;
  }

  // **min** returns the key of the minimum member value.
  exports["min"] = min;
  function min(callback, context, object) {
    var result;
    if (arguments.length < 3) {
      object = context;
      context = nil;
    }
    fold(function (memo, key, value, object) {
      var criteria = callback.call(context, key, value, object);
      if (criteria < memo) {
        memo = criteria;
        result = key;
      }
      return memo;
    }, Infinity, object);
    return result;
  }

  // **partition** separates an object"s members into two groups: those for which the callback
  // returns a truthy value, and those for which it returns a falsy value. `partition` is preferred
  // to invoking both `filter` and `reject`.
  exports["partition"] = partition;
  function partition(callback, context, object) {
    var trues = {}, falses = {};
    if (arguments.length < 3) {
      object = context;
      context = nil;
    }
    forEach(function (key, value, object) {
      (callback.call(context, key, value, object) ? trues : falses)[key] = value;
    }, object);
    return [trues, falses];
  }

  // **groupBy** groups an object"s members using the criteria provided by a callback.
  exports["groupBy"] = groupBy;
  function groupBy(callback, context, object) {
    if (arguments.length < 3) {
      object = context;
      context = nil;
    }
    return fold(function (memo, key, value, object) {
      var criteria = callback.call(context, key, value, object);
      return (memo[criteria] || (memo[criteria] = {}))[key] = value, memo;
    }, {}, object);
  }

  // **curry** partially applies the provided `method`, returning a function that, when invoked,
  // calls `method` with the pre-filled arguments prepended to any additional arguments.
  exports["curry"] = curry;
  function curry(method) {
    var parameters, length;
    parameters = slice.call(arguments, 1);
    // Return the original function if no arguments were provided.
    if (!(length = parameters.length)) {
      return method;
    }
    return function () {
      // Append the additional arguments.
      var sourceLength = arguments.length;
      if (sourceLength) {
        while (sourceLength--) {
          parameters[length + sourceLength] = arguments[sourceLength];
        }
      }
      return apply.call(method, this, parameters);
    };
  }
  return exports;
});