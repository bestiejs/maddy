/*!
 * Maddy functional programming micro-library
 * http://github.com/kitgoncharov/maddy
 *
 * Copyright 2011, Kit Goncharov
 * http://kitgoncharov.github.com
 *
 * Maddy is inspired by FuseJS and Underscore.
 * Released under the MIT License.
*/

(function () {
  // Convenience aliases.
  var toString = Object.prototype.toString, slice = Array.prototype.slice,
  apply = Function.prototype.apply,

  // Set up the `Maddy` object.
  Maddy = typeof exports == 'object' && exports || (this.Maddy = {

    // Restores the original value of the `Maddy` property and returns a
    // reference to the `Maddy` object.
    'noConflict': (function (exports) {
      // Save the previous value of the global `Maddy` property.
      var original = exports.Maddy;
      function noConflict() {
        exports.Maddy = original;
        return Maddy;
      }
      return noConflict;
    }(this))
  }),

  // Matches internal `[[Class]]` names returned by `Object#toString`.
  className = /^\[object\s(.*?)\]$/,

  // `Maddy.each` executes an iterator function once per array element or
  // object member.
  forEach = Maddy.forEach = Maddy.each = (function () {
    // The internal `Properties` constructor is used to test for bugs in the
    // current environment's `for...in` iteration algorithm.
    function Properties() {
      this.toString = 1;
    }
    Properties.prototype.toString = 1;

    // Simulate `Object#hasOwnProperty` for Safari 2.
    var hasOwnProperty = {}.hasOwnProperty || function (property) {
      // Save the original prototype chain.
      var original = this.__proto__, result;
      // Break the prototype chain.
      this.__proto__ = null;
      result = property in this;
      // Restore the prototype chain.
      this.__proto__ = original;
      return result;
    }, length = 0, properties = new Properties, property, each;

    // Iterate over a new instance of the `Properties` constructor.
    for (property in properties) {
      // Ignore inherited properties to correctly detect iteration bugs.
      if (hasOwnProperty.call(properties, property)) length++;
    }

    if (!length) {
      // JScript ignores shadowed non-enumerable properties.
      properties = ['constructor', 'toString', 'valueOf', 'isPrototypeOf', 'hasOwnProperty', 'propertyIsEnumerable', 'toLocalString'];
      each = function forEach(object, iterator, context) {
        var index = 0, length = object.length, property;
        if (typeof iterator != 'function') throw new TypeError;
        if (length === +length) {
          // Use a `for` loop to iterate over arrays and array-like objects
          // with a numerical `length` property.
          for (index = 0; index < length; index++) {
            // Break if the iterator function explicitly returns `false`.
            if (index in object && iterator.call(context, object[index], index, object) === false) break;
          }
        } else {
          for (property in object) {
            // Break if the iterator function explicitly returns `false`.
            if (hasOwnProperty.call(object, property) && iterator.call(context, object[property], property, object) === false) break;
          }
          // Provide a workaround for the JScript bug.
          while ((property = properties[index++])) {
            if (hasOwnProperty.call(object, property) && iterator.call(context, object[property], property, object) === false) break;
          }
        }
      };
    } else if (length == 2) {
      // Safari 2 enumerates all shadowed and inherited properties.
      each = function forEach(object, iterator, context) {
        var index = 0, length = object.length, isFunction, properties, property;
        if (typeof iterator != 'function') throw new TypeError;
        if (length === +length) {
          for (index = 0; index < length; index++) {
            if (index in object && iterator.call(context, object[index], index, object) === false) break;
          }
        } else {
          // Detect functions and skip iterating the `prototype` property, as it's
          // handled inconsistently across environments.
          isFunction = getClassOf(object) == 'Function';
          // Create a cache of iterated properties.
          properties = {};
          for (property in object) {
            // Cache each property to prevent enumeration of inherited and shadowed
            // properties.
            if (!(isFunction && property == 'prototype') && !hasOwnProperty.call(properties, property) && (properties[property] = 1) && hasOwnProperty.call(object, property) && iterator.call(context, object[property], property, object) === false) break;
          }
        }
      };
    } else {
      each = function forEach(object, iterator, context) {
        var index = 0, length = object.length, isFunction, property;
        if (typeof iterator != 'function') throw new TypeError;
        if (length === +length) {
          for (index = 0; index < length; index++) {
            if (index in object && iterator.call(context, object[index], index, object) === false) break;
          }
        } else {
          isFunction = getClassOf(object) == 'Function';
          for (property in object) {
            if (!(isFunction && property == 'prototype') && hasOwnProperty.call(object, property) && iterator.call(context, object[property], property, object) === false) break;
          }
        }
      };
    }
    return each;
  }());

  // The current version of Maddy.
  Maddy.version = '0.0.1';

  // `Maddy.map` returns an array containing the results of invoking an
  // `iterator` function on each array element or object member.
  Maddy.map = map;
  function map(object, iterator, context) {
    var results = [];
    if (typeof iterator != 'function') throw new TypeError;
    forEach(object, function (value, property, object) {
      results.push(iterator.call(context, value, property, object));
    });
    return results;
  }

  // `Maddy.reduce` applies a function against an accumulator and each value of
  // the array, from left-to-right, as to reduce it to a single value. Similar
  // to `inject` or `foldl`.
  Maddy.reduce = Maddy.foldl = Maddy.inject = reduce;
  function reduce(object, iterator, memo, context) {
    var index = 0, length = +object.length;
    if (typeof iterator != 'function' || !length && arguments.length == 1) throw new TypeError;
    if (arguments.length < 3) {
      do {
        if (index in object) {
          memo = object[index++];
          break;
        }
        if (++index >= length) throw new TypeError;
      } while (true);
    }
    for (; index < length; index++) {
      if (index in object && (memo = iterator.call(context, memo, object[index], index, object)) === false) break;
    }
    return memo;
  }

  // `Maddy.reduceRight` applies an `iterator` function simultaneously against
  // two values of the array, from right-to-left, as to reduce it to a single
  // value. Similar to `foldr`.
  Maddy.reduceRight = Maddy.foldr = reduceRight;
  function reduceRight(object, iterator, memo, context) {
    var length = +object.length, index = length - 1;
    if (typeof iterator != 'function' || !length && arguments.length == 1) throw new TypeError;
    if (arguments.length < 3) {
      do {
        if (index in object) {
          memo = object[index--];
          break;
        }
        if (--index < 0) throw new TypeError;
      } while (true);
    }
    for (; index >= 0; index--) {
      if (index in object && (memo = iterator.call(context, memo, object[index], index, object)) === false) break;
    }
    return memo;
  }

  // `Maddy.some`, aliased as `Maddy.any`, determines if the `iterator`
  // function returns `true` for at least one array element or object member.
  Maddy.some = Maddy.any = some;
  function some(object, iterator, context) {
    var result = false;
    if (typeof iterator != 'function') throw new TypeError;
    forEach(object, function (value, property, object) {
      if ((result = iterator.call(context, value, property, object))) return false;
    });
    return result;
  }

  // `Maddy.filter`, aliased as `Maddy.select`, returns an array containing all
  // the array elements or object members for which the `iterator` function
  // returns `true`. `Maddy.reject` is the opposite of this method.
  Maddy.filter = Maddy.select = filter;
  function filter(object, iterator, context) {
    var results = [];
    if (typeof iterator != 'function') throw new TypeError;
    forEach(object, function (value, property, object) {
      if (iterator.call(context, value, property, object)) results.push(value);
    });
    return results;
  }

  // `Maddy.every`, aliased as `Maddy.all`, determines whether the `iterator`
  // function returns `true` for all array elements or object members.
  Maddy.every = Maddy.all = every;
  function every(object, iterator, context) {
    var result = true;
    if (typeof iterator != 'function') throw new TypeError;
    forEach(object, function (value, property, object) {
      if ((result = iterator.call(context, value, property, object))) return false;
    });
    return result;
  }

  // `Maddy.find`, aliased as `Maddy.detect`, returns the first value of an
  // array or object for which the `iterator` function returns `true`.
  Maddy.find = Maddy.detect = find;
  function find(object, iterator, context) {
    var result;
    if (typeof iterator != 'function') throw new TypeError;
    some(object, function (value, property, object) {
      if (iterator.call(context, value, property, object)) {
        result = value;
        return false;
      }
    });
    return result;
  }

  // `Maddy.reject` returns an array containing all the array elements or
  // object members for which the `iterator` function does not return `true`.
  // `Maddy.filter` is the opposite of this method.
  Maddy.reject = reject;
  function reject(object, iterator, context) {
    var results = [];
    if (typeof iterator != 'function') throw new TypeError;
    forEach(object, function (value, property, object) {
      if (!iterator.call(context, value, property, object)) results.push(value);
    });
    return results;
  }

  // `Maddy.include`, aliased as `Maddy.contains`, determines if the object or
  // array contains the given value.
  Maddy.include = Maddy.contains = include;
  function include(object, element) {
    var contains = false;
    some(object, function (value) {
      if ((contains = value === element)) return false;
    });
    return contains;
  }

  // `Maddy.invoke` invokes a method with optional arguments on every array
  // element or object member.
  Maddy.invoke = invoke;
  function invoke(object, method) {
    var parameters = slice.call(arguments, 2);
    return map(object, function (value) {
      return apply.call(value[method], value, parameters);
    });
  }

  // `Maddy.pluck` returns an array containing the `property` values from
  // every array element or object member.
  Maddy.pluck = pluck;
  function pluck(object, property) {
    return map(object, function (value) {
      return value[property];
    });
  }

  // `Maddy.max` returns the maximum element or member.
  Maddy.max = max;
  function max(object, iterator, context) {
    var comparable, computed, result = null;
    if (!iterator && (iterator = Maddy.identity) && getClassOf(object) == 'Array') {
      result = Math.max.apply(Math, object);
      // Ensure that the result is not `NaN`.
      if (result == result) return result;
      result = null;
    }
    forEach(object, function (value, property, object) {
      comparable = iterator.call(context, value, property, object);
      if (computed == null || comparable > computed) {
        computed = comparable;
        result = value;
      }
    });
    return result;
  }

  // `Maddy.min` returns the minimum element or member.
  Maddy.min = min;
  function min(object, iterator, context) {
    var comparable, computed, result = null;
    if (!iterator && (iterator = Maddy.identity) && getClassOf(object) == 'Array') {
      result = Math.min.apply(Math, object);
      if (result == result) return result;
      result = null;
    }
    forEach(object, function (value, property, object) {
      comparable = iterator.call(context, value, property, object);
      if (computed == null || comparable < computed) {
        computed = comparable;
        result = value;
      }
    });
    return result;
  }
  
  // `Maddy.identity` is used throughout the library as a default value for
  // iterator functions.
  Maddy.identity = identity;
  function identity(value) {
    return value;
  }

  // `Maddy.partition` separates the array elements or object members into two
  // groups: those for which the `iterator` function returns `true`, and those
  // for which the function returns `false`. This is preferred to using both
  // `filter` and `reject`.
  Maddy.partition = partition;
  function partition(object, iterator, context) {
    var trues = [], falses = [];
    forEach(object, function (value, property, object) {
      (iterator.call(context, value, property, object) ? trues : falses).push(value);
    });
    return [trues, falses];
  }

  // `Maddy.sortBy` sorts an object's values using the criterion provided by an
  // `iterator` function.
  Maddy.sortBy = sortBy;
  function sortBy(object, iterator, context) {
    return pluck(map(object, function (value, property, object) {
      return {
        'value': value,
        'criteria': iterator.call(context, value, property, object)
      };
    }).sort(function (left, right) {
      left = left.criteria;
      right = right.criteria;
      return left < right ? -1 : left > right ? 1 : 0;
    }), 'value');
  }

  // `Maddy.groupBy` groups an object's values using the property name
  // provided by an `iterator` function.
  Maddy.groupBy = groupBy;
  function groupBy(object, iterator, context) {
    var results = {};
    forEach(object, function (value, property, object) {
      var key = iterator.call(context, value, property, object);
      (results[key] || (results[key] = [])).push(value);
    });
    return results;
  }

  // `Maddy.first` returns the first element or elements of an array.
  // `iterator` may specify either the number of elements to return, or an
  // iterator function.
  Maddy.first = first;
  function first(object, iterator, context) {
    var index = -1, length = +object.length;
    if (iterator == null) {
      while (++index < length) {
        if (index in object) return object[index];
      }
    } else if (typeof iterator == 'function') {
      while (++index < length) {
        // Return the first element for which the function returns true.
        if (iterator.call(context, object[index], index, object)) return object[index];
      }
    } else {
      // Coerce the provided index to a number.
      index = +iterator;
      if (index != index) return [];
      // Return the specified number of elements.
      index = index < 0 ? 0 : index > length ? length : index;
      return slice.call(object, 0, index);
    }
  }

  // `Maddy.last` returns the last element or elements of an array.
  Maddy.last = last;
  function last(object, iterator, context) {
    var length = +object.length, index;
    if (iterator == null) {
      return object[length && length - 1];
    } else if (typeof iterator == 'function') {
      while (length--) {
        if (iterator.call(context, object[length], length, object)) return object[length];
      }
    } else {
      index = +iterator;
      if (index != index) return [];
      index = index < 0 ? 0 : index > length ? length : index;
      return slice.call(object, length - index);
    }
  }

  // `Maddy.compact` removes all `null` and `undefined` values from an array or
  // object.
  Maddy.compact = compact;
  function compact(object) {
    return filter(object, function (value) {
      return value != null;
    });
  }

  // `Maddy.flatten` returns a flattened version of an object or array.
  Maddy.flatten = flatten;
  function flatten(object) {
    var results = [];
    forEach(object, function (value) {
      var length, source, sourceLength;
      if (getClassOf(value) == 'Array') {
        length = results.length;
        source = flatten(value);
        sourceLength = source.length;
        while (sourceLength--) results[length + sourceLength] = source[sourceLength];
      } else {
        results.push(value);
      }
    });
    return results;
  }

  // `Maddy.without` returns a version of the array that does not contain the
  // specified values.
  Maddy.without = without;
  function without(object) {
    var parameters = slice.call(arguments, 1);
    return reject(object, function (value) {
      return include(parameters, value);
    });
  }

  // `Maddy.unique`, aliased as `Maddy.uniq`, returns a duplicate-free version
  // of the object or array.
  Maddy.unique = Maddy.uniq = unique;
  function unique(object) {
    var results = [];
    forEach(object, function (value) {
      if (!include(results, value)) results.push(value);
    });
    return results;
  }

  // `Maddy.intersect` returns an array that contains the values shared by both
  // objects or arrays.
  Maddy.intersect = intersect;
  function intersect(first, second) {
    var results = [];
    forEach(first, function (value) {
      if (include(second, value) && !include(results, value)) results.push(value);
    });
    return results;
  }

  // `Maddy.zip` zips together multiple lists into a single array of tuples.
  // Each tuple contains one value per original sequence.
  Maddy.zip = zip;
  function zip() {
    var index = -1, length = max(pluck(arguments, 'length')), results = Array(length);
    while (++index < length) results.push(pluck(arguments, index));
    return results;
  }

  // `Maddy.indexOf` returns the index of the first occurrence of an element in
  // an array, or `-1` if the element is not present in the array. The array is
  // searched starting from `index`, or `0` if `index` is omitted.
  Maddy.indexOf = indexOf;
  function indexOf(object, element, index) {
    var length = +object.length;
    if (!length) return -1;
    index = +index || 0;
    if (index < 0) index = length + index;
    index--;
    while (++index < length) {
      if (index in length && object[index] === element) return index;
    }
    return -1;
  }

  // `Maddy.lastIndexOf` returns the index of the last occurrence of an element
  // in an array. The array is searched backward, starting from `index` or the
  // array's length if `index` is omitted.
  Maddy.lastIndexOf = lastIndexOf;
  function lastIndexOf(object, element, index) {
    var length = +object.length;
    index = index == null ? length : +index;
    if (!length) {
      return -1;
    } else if (index > length) {
      index = length - 1;
    } else if (index < 0) {
      index = length + index;
    }
    index++;
    while (--index > -1) {
      if (index in object && object[index] === element) break;
    }
    return index;
  }

  // `Maddy.range` returns an array containing an arithmetic sequence.
  Maddy.range = range;
  function range(first, last, difference) {
    var index = 0, results, length;
    if (arguments.length <= 1) {
      last = first > 0 ? +first : 0;
      first = 0;
      // Invalid argument; return an empty range.
      if (!last) return results;
    }
    // Check if the provided difference is valid.
    if (!(difference = +difference)) difference = 1;
    results = Array((length = Math.max(Math.ceil(last - first) / difference), 0));
    while (index < length) {
      results[index++] = first;
      first += difference;
    }
    return results;
  }

  // `Maddy.keys` returns an array containing an object's property names.
  Maddy.keys = keys;
  function keys(object) {
    var results = [];
    if (object != Object(object)) throw new TypeError;
    forEach(object, function (value, key) {
      results.push(key);
    });
    return results;
  }

  // `Maddy.values` returns an array containing an object's property values.
  Maddy.values = values;
  function values(object) {
    var results = [];
    if (object != Object(object)) throw new TypeError;
    forEach(object, function (value) {
      results.push(value);
    });
    return results;
  }

  // `Maddy.extend` extends an object with the properties of the provided
  // object(s).
  Maddy.extend = extend;
  function extend(destination) {
    // Copies each property to the destination object.
    function iterator(value, property) {
      destination[property] = value;
    }
    for (var index = 1, length = arguments.length; index < length; index++) {
      forEach(arguments[index], iterator);
    }
    return destination;
  }

  // `Maddy.isEqual` recursively compares two objects to determine if they are
  // equal.
  Maddy.isEqual = (function () {
    // Based on work by Jeremy Ashkenas, Philippe Rathe, and Mark Miller.
    function eq(left, right, stack) {
      var className, result, size, sizeRight;
      // Identical objects are equal. Note: `0 === -0`, but they aren't equal.
      if (left === right) return left != 0 || 1 / left == 1 / right;
      // Compare `[[Class]]` names.
      className = getClassOf(left);
      if (className != getClassOf(right)) return false;
      switch (className) {
        // `null`, `undefined`, and functions are compared by identity.
        case 'Null':
        case 'Undefined':
        case 'Function':
          return left == right;
        // Strings, numbers, dates, and booleans are compared by value.
        case 'String':
          // Primitives and their corresponding objects are equivalent.
          return '' + left == '' + right;
        case 'Number':
        case 'Date':
        case 'Boolean':
          left = +left;
          right = +right;
          // `NaN`s are non-reflexive.
          return left != left ? right != right : left == right;
        // RegExps are compared by their source patterns and flags.
        case 'RegExp':
          return left.source == right.source && left.global == right.global && left.multiline == right.multiline && left.ignoreCase == right.ignoreCase;
      }
      // Recursively compare objects and arrays.
      if (typeof left != 'object') return false;
      // Assume equality for cyclic structures.
      size = stack.length;
      while (size--) {
        if (stack[size] == left) return true;
      }
      // Add the object to the stack of traversed objects.
      stack.push(left);
      result = true;
      size = sizeRight = 0;
      if (className == 'Array') {
        // Compare array lengths to determine if a deep comparison is necessary.
        size = left.length;
        result = size == right.length;
        if (result) {
          while (size--) {
            if (size in left && !(result = size in right && eq(left[size], right[size], stack))) break;
          }
        }
      } else {
        forEach(left, function (value, property) {
          // Count the expected number of properties.
          size++;
          // Deep compare each object member.
          if (!(result = property in right && eq(value, right[property], stack))) return false;
        });
        // Ensure that both objects contain the same number of properties.
        if (result) {
          forEach(right, function () {
            // Break as soon as the expected property count is greater.
            if (++sizeRight > size) return false;
          });
          result = size == sizeRight;
        }
      }
      // Remove the object from the traversed objects stack.
      stack.pop();
      return result;
    }

    // Expose the recursive `isEqual` method.
    function isEqual(left, right) {
      return eq(left, right, []);
    }

    return isEqual;
  }());

  // `Maddy.isEmpty` checks if the provided object is empty.
  Maddy.isEmpty = isEmpty;
  function isEmpty(object) {
    var className = getClassOf(object), result = true;
    switch (className) {
      // `null` and `undefined` are invalid object types.
      case 'Null':
      case 'Undefined':
        throw new TypeError;
      // Most native ECMAScript objects are not empty.
      case 'Date':
      case 'Boolean':
      case 'Function':
      case 'RegExp':
        return false;
      // Empty strings and arrays contain a `length` of 0.
      case 'String':
      case 'Array':
        return !object.length;
      default:
        forEach(object, function () {
          // This callback should never be invoked for an empty object.
          return (result = false);
        });
    }
    return result;
  }

  // `Maddy.getClassOf` returns the `[[Class]]` name of an object.
  Maddy.getClassOf = getClassOf;
  function getClassOf(object) {
    var match;
    // `Null` and `Undefined` are not `[[Class]]` names, but are specified in
    // section 15.2.4.2 of the ECMAScript 5 spec.
    if (object == null) {
      return 'Null';
    } else if (typeof object == 'undefined') {
      return 'Undefined';
    } else {
      // In some environments (e.g, Mozilla Rhino), `Object#toString` may
      // return an implementation-dependent string for host objects that does
      // not conform to the format outlined in the spec.
      match = className.exec(Object.prototype.toString.call(object));
      return match && match[1] || 'Object';
    }
  }

  // `Maddy.times` executes an `iterator` function `count` times.
  Maddy.times = times;
  function times(count, iterator, context) {
    var index = -1;
    while (++index < count && iterator.call(context, index) !== false);
  }
}).call(this);