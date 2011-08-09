/*!
 * Maddy Unit Tests
 * http://github.com/kitgoncharov/maddy
 *
 * Utility methods inspired by QUnit.
 * http://github.com/jquery/qunit
*/

(function () {
  // Convenience aliases.
  var Spec = this.Spec, Maddy = this.Maddy, toString = Object.prototype.toString,
  document = this.document,

  // A map of escape sequences for common control characters.
  escapes = {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '"': '\\"',
    '\\': '\\\\'
  },

  // Matches control characters, double quotes, and the escape character.
  escapable = /[\x00-\x1f"\\]/g,

  // Create the Maddy spec.
  tests = new Spec('Maddy Unit Tests');

  // Flattens cyclical structures. Based on work by Douglas Crockford.
  function flatten(object) {
    var objects = [], paths = [];
    // Converts cyclical structures to JSONPath objects.
    function resolve(value, path) {
      var length, results;
      if (typeof value == 'object' && value) {
        length = objects.length;
        while (length--) {
          if (objects[length] == value) return {'$ref': paths[length]};
        }
        objects.push(value);
        paths.push(path);
        if (toString.call(value) == '[object Array]') {
          results = [];
          length = value.length;
          while (length--) {
            results[length] = resolve(value[length], path + '[' + length + ']');
          }
        } else {
          results = {};
          for (length in value) {
            results[length] = resolve(value[length], path + '["' + escape(length) + '"]');
          }
        }
        return results;
      } else {
        return value;
      }
    }
    return resolve(object, '$');
  }

  // Replaces a control character with its corresponding escape sequence.
  function escape(value) {
    var result = '', index, lastIndex = escapable.lastIndex = 0, match;
    value = result + value;
    // Walk the input string.
    while ((match = escapable.exec(value))) {
      index = match.index;
      match = match[0];
      // Append all characters before the control character.
      result += value.slice(lastIndex, index);
      // Update the RegExp's `lastIndex` property.
      lastIndex = escapable.lastIndex = index + match.length;
      // Append and cache the escape sequence.
      result += match in escapes ? escapes[match] : (escapes[match] = ('\\u' + ('0000' + match.charCodeAt(0).toString(16)).slice(-4)));
    }
    // Append the remainder of the input string.
    if (lastIndex < value.length) result += value.slice(lastIndex);
    return result + '';
  }

  // Recursively inspects an object. Based on work by Tobie Langel.
  function serialize(value) {
    var className = toString.call(value), length, results, property, month,
    date, hours, minutes, seconds;
    // `null` and `undefined` are represented as such.
    if (value == null) return '' + value;
    switch (className) {
      // Double-quote strings and escape all control characters.
      case '[object String]':
        return '"' + escape(value) + '"';
      // Booleans and numbers are represented as such.
      case '[object Number]':
        return (value == 1 / 0) ? 'Infinity' : (value == -1 / 0) ?
          '-Infinity' : (value != value) ? 'NaN' : ('' + value);
      case '[object Boolean]':
        return value ? 'true' : 'false';
      // Similar to `RegExp#toString`.
      case '[object RegExp]':
        results = '/' + value.source + '/';
        if (value.global) results += 'g';
        if (value.ignoreCase) results += 'i';
        if (value.multiline) results += 'm';
        return results;
      // Similar to `Date#toJSON`.
      case '[object Date]':
        if (+value) {
          // See section 15.9.1.15 of the ES5 spec for the ISO date format.
          month = value.getUTCMonth() + 1;
          date = value.getUTCDate();
          hours = value.getUTCHours();
          minutes = value.getUTCMinutes();
          seconds = value.getUTCSeconds();
          // Months, dates, hours, minutes, and seconds should have two digits.
          return value.getUTCFullYear() + '-' + (month < 10 ? '0' + month :
            month) + '-' + (date < 10 ? '0' + date : date) + 'T' + (hours <
              10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes :
              minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds) + '.' +
              // Milliseconds should have three digits.
              ('000' + value.getUTCMilliseconds()).slice(-3) + 'Z';
        }
        return 'Invalid Date';
      // Avoid function decompilation.
      case '[object Function]':
        return (value.displayName || value.name || 'anonymous') + '()';
    }
    if (typeof value != 'object') return '{...}';
    // Flatten cyclical structures.
    value = flatten(value);
    results = [];
    if (className == '[object Array]') {
      length = value.length;
      // Inspect each element.
      while (length--) results[length] = serialize(value[length]);
      results = '[' + results.join(', ') + ']';
    } else {
      for (property in value) results.push('"' + escape(property) + '": ' + serialize(value[property]));
      results = '{' + results.join(', ') + '}';
    }
    return results;
  }

  // Internal event listener; expands and collapses test messages.
  function onClick() {
    // The event target is the list of messages.
    var target = this.parentNode && this.parentNode.getElementsByTagName('ol')[0];
    if (target) target.style.display = target.style.display == 'none' ? '' : 'none';
  }

  // Attach an event listener for logging test results.
  tests.bind('all', function (event) {
    var type = event.type, target = event.target,
    // Elements for logging the test results.
    element, name, messages, message, data, actual, expected,
    // Contains the aggregate spec results.
    results = document.getElementById('results'),
    // Contains the aggregate spec summary.
    stats = document.getElementById('stats'),
    // Displays the spec status.
    status = document.getElementById('status');
    if (!results || !status || !stats) return;
    switch (type) {
      // `start` is triggered before any tests are run.
      case 'start':
        // Clear the previous test results.
        while (results.firstChild) results.removeChild(results.firstChild);
        // Reset the spec status.
        while (status.firstChild) status.removeChild(status.firstChild);
        status.className = 'running';
        // Clear the previous aggregate spec summary.
        while (stats.firstChild) stats.removeChild(stats.firstChild);
        stats.appendChild(document.createTextNode('Running...'));
        break;
      // `setup` is triggered at the start of each test.
      case 'setup':
        // Create a new element for the current test results.
        element = document.createElement('li');
        element.className = 'running';
        name = document.createElement('strong');
        // Show the name of the current test.
        name.appendChild(document.createTextNode(target.name));
        // Add an event listener for expanding and collapsing the test messages.
        name.onclick = onClick;
        element.appendChild(name);
        results.appendChild(element);
        break;
      // `teardown` is triggered at the end of each test.
      case 'teardown':
        // The last element in the test results contains the results for the current test.
        if (!(element = results.lastChild)) return;
        element.className = target.failures ? 'fail' : 'pass';
        break;
      // `complete` is triggered once all tests have finished running.
      case 'complete':
        // Set the spec status.
        status.className = target.failures ? 'fail' : 'pass';
        // Create the aggregate spec summary.
        while (stats.firstChild) stats.removeChild(stats.firstChild);
        stats.appendChild(document.createTextNode(target.assertions + ' assertions, ' + target.failures + ' failures.'));
        // Show the spec stats.
        results.parentNode.insertBefore(stats, results.nextSibling);
        break;
      default:
        if (!(element = results.lastChild)) return;
        // Create the list of messages.
        if (!(messages = element.getElementsByTagName('ol')[0])) {
          messages = document.createElement('ol');
          // Hide the messages.
          messages.style.display = 'none';
          element.appendChild(messages);
        }
        // Create a new message.
        message = document.createElement('li');
        if (type == 'assertion') {
          // `assertion` is triggered when an assertion succeeds.
          message.className = 'assertion';
          // Add the message to the list of messages.
          message.appendChild(document.createTextNode(event.message));
        } else if (type == 'failure') {
          // `failure` is triggered when an assertion fails.
          message.className = 'failure';
          message.appendChild(document.createTextNode(event.message));
          // Format and show the expected value.
          expected = document.createElement('span');
          expected.className = 'expected';
          expected.appendChild(document.createTextNode('Expected: '));
          data = document.createElement('code');
          // Convert the expected value to JSON.
          data.appendChild(document.createTextNode(serialize(event.expected)));
          expected.appendChild(data);
          message.appendChild(expected);
          // Format and show the actual value.
          actual = document.createElement('span');
          actual.className = 'actual';
          actual.appendChild(document.createTextNode('Actual: '));
          data = document.createElement('code');
          data.appendChild(document.createTextNode(serialize(event.actual)));
          actual.appendChild(data);
          message.appendChild(actual);
        }
        // Show the message.
        messages.appendChild(message);
    }
  });

  tests.addTest('forEach', function (test) {
    var collection = [1, 2, 3, 4, 5, 6], values = [], callback = function (value) {
      values.push(value * this.K);
    };
    Maddy.forEach(collection, function (value, index, object) {
      if (value == 2) return;
      if (value == 5) {
        test.equal(index, 4, '`index` argument');
        test.equal(object, collection, '`object` argument');
        return false;
      }
      values.push(value);
    });
    test.deepEqual(values, [1, 3, 4], '`break` and `continue`');
    values = [];
    Maddy.each(collection, function (value) {
      values.push(value * this.K);
    }, {'K': 2});
    test.deepEqual(values, [2, 4, 6, 8, 10, 12], '`context` argument');
    // The `Test` constructor tests for bugs in the environment's `for...in` loop.
    function Test() {
      this.constructor = true;
      this.toString = false;
      this.valueOf = null;
    }
    Test.prototype = {
      'constructor': 1,
      'toString': 2,
      'valueOf': 3,
      'hasOwnProperty': 5
    };
    Maddy.forEach(new Test, function (value, property) {
      switch (property) {
        case 'constructor':
          test.equal(value, true, 'User-defined `constructor` property');
          break;
        case 'toString':
          test.equal(value, false, 'User-defined `toString` property');
          break;
        case 'valueOf':
          test.equal(value, null, 'User-defined `valueOf` property');
      }
    });
    test.done(7);
  });

  tests.addTest('map', function () {
    this.deepEqual(Maddy.map([1, 2, 3], function (value) {
      return value * 2;
    }), [2, 4, 6], '`map` can double the values in the array');
    this.deepEqual(Maddy.map([2, 4, 6], function (value, index) {
      return value + index * this.K;
    }, {'K': 3}), [2, 7, 12], '`index` and `context` arguments');
    this.done(2);
  });

  tests.addTest('reduce', function () {
    this.equal(Maddy.reduce([1, 2, 3], function (memo, value) {
      return memo + value;
    }), 6, '`reduce` can sum up the values of an array');
    this.equal(Maddy.inject([2, 4, 6], function (memo, value, index) {
      return memo + (value + index * this.K);
    }, 0, {'K': 4}), 24, '`index` and `context` arguments');
    this.done(2);
  });

  tests.addTest('reduceRight', function () {
    this.equal(Maddy.reduceRight(['Foo', 'Bar', 'Baz'], function (memo, value) {
      return memo + value;
    }, ''), 'BazBarFoo', '`reduceRight` performs right folds');
    this.deepEqual(Maddy.foldr([[0, 1], [2, 3], [4, 5]], function (memo, value) {
      return memo.concat(value);
    }, []), [4, 5, 2, 3, 0, 1], '`foldr` can flatten arrays');
    this.equal(Maddy.reduceRight([0, 1, 2, 3], function (memo, value) {
      return memo + value * this.K;
    }, 0, {'K': 3}), 18, '`context` argument');
    this.done(3);
  });

  tests.addTest('some', function () {
    this.ok(!Maddy.some([], Maddy.identity), 'Empty array');
    this.ok(!Maddy.some([false, false, false], Maddy.identity), 'Array contains all `false` values');
    this.ok(Maddy.some([false, false, true], Maddy.identity), 'Array contains one `true` value');
    this.ok(!Maddy.some([1, 11, 29], function (value) {
      return !(value % 2);
    }), 'Array contains all odd numbers');
    this.ok(Maddy.some([1, 10, 29], function (value) {
      return !(value % 2);
    }), 'Arrat contains one even number');
    this.ok(Maddy.any([false, false, true], Maddy.identity), '`some` is aliased as `any`');
    this.done(6);
  });

  tests.addTest('filter', function () {
    this.deepEqual(Maddy.filter([1, 2, 3, 4, 5, 6], function (value) {
      return !(value % 2);
    }), [2, 4, 6], '`filter` returns an array of elements that match the iterator function');
    this.done(1);
  });

  tests.addTest('every', function () {
    this.ok(Maddy.every([], Maddy.identity), 'Empty array');
    this.ok(Maddy.every([true, true, true], Maddy.identity), 'Array contains all `true` values');
    this.ok(!Maddy.every([true, false, true], Maddy.identity), 'Array contains one `false` value');
    this.ok(Maddy.every([0, 10, 28], function (value) {
      return !(value % 2);
    }), 'Array contains all even numbers');
    this.ok(!Maddy.every([0, 11, 28], function (value) {
      return !(value % 2);
    }), 'Array contains one odd number');
    this.ok(Maddy.all([true, true, true], Maddy.identity), '`every` is aliased as `all`');
    this.done(6);
  });

  tests.addTest('find', function () {
    var result = Maddy.find([1, 2, 3], function (value) {
      return value * 2 == 4;
    });
    this.equal(result, 2, 'Found the first `2` and terminated the loop');
    result = (function () {
      return Maddy.detect(arguments, function (value) {
        return value * 2 == 4;
      });
    }(1, 2, 3));
    this.equal(result, 2, '`arguments` object; aliased as `detect`');
    this.done(2);
  });

  tests.addTest('reject', function () {
    var odds = Maddy.reject([1, 2, 3, 4, 5, 6], function (value) {
      return !(value % 2);
    });
    this.deepEqual(odds, [1, 3, 5], 'Rejected each even number');
    this.done(1);
  });

  tests.addTest('include', function () {
    this.ok(Maddy.include([1, 2, 3], 2), 'The value is in the array');
    this.ok(!Maddy.include([1, 3, 9], 2), 'The value is not in the array');
    this.equal(Maddy.include({
      'Moe': 1,
      'Larry': 3,
      'Curly': 9
    }, 3), true, 'Invoking `include` on an object should check each value');
    this.done(3);
  });

  tests.addTest('invoke', function () {
    this.deepEqual(Maddy.invoke([[5, 1, 7], [3, 2, 1]], 'sort'), [[1, 5, 7], [1, 2, 3]], '`invoke` can invoke a method on all array elements');
    this.deepEqual(Maddy.invoke(['Kit', 'Maddy'], 'toUpperCase'), ['KIT', 'MADDY'], '`invoke` can invoke a method on an array of strings');
    this.deepEqual(Maddy.invoke([1, 2, 3, 4, 5, 6], 'toString', 2), ['1', '10', '11', '100', '101', '110'], 'Optional arguments');
    this.done(3);
  });

  tests.addTest('pluck', function () {
    var people = [{
      'name': 'John-David Dalton',
      'nickname': 'jdalton',
      'age': 28
    }, {
      'name': 'Kit Goncharov',
      'nickname': 'ksgoncharov',
      'age': 17
    }];
    this.deepEqual(Maddy.pluck(people, 'nickname'), ['jdalton', 'ksgoncharov'], '`pluck` should return an array of the specified property values');
    this.done(1);
  });

  tests.addTest('max', function () {
    var names = ['John-David', 'Sam', 'Kit', 'Maddy'];
    this.equal(Maddy.max([1, 2, 3, 4]), 4, 'Returns the maximum value');
    this.equal(Maddy.max([-2, -1, 0, 1, 2]), 2, 'Works with arrays containing positive and negative numbers');
    this.equal(Maddy.max(names), 'Sam', 'Works with string arrays');
    this.equal(Maddy.max(names, function (value) {
      return -value.charCodeAt(0);
    }), 'John-David', 'Works with an optional iterator function');
    this.done(4);
  });

  tests.addTest('min', function () {
    var names = ['John-David', 'Sam', 'Kit', 'Maddy'];
    this.equal(Maddy.min([5, 6, 7, 8]), 5, 'Returns the minimum value');
    this.equal(Maddy.min([-1, 2, -3, 0, -5]), -5, 'Works with arrays containing positive and negative numbers');
    this.equal(Maddy.min(names), 'John-David', 'Works with string arrays');
    this.equal(Maddy.min(names, function (value) {
      return -value.charCodeAt(0);
    }), 'Sam', 'Works with an optional iterator function');
    this.done(4);
  });

  tests.addTest('partition', function () {
    this.deepEqual(Maddy.partition(['John-David Dalton', 'Joe Gornick', 'Kit Goncharov', 'Maddy Jalbert'], function (name) {
      return name.length == 13;
    }), [['Kit Goncharov', 'Maddy Jalbert'], ['John-David Dalton', 'Joe Gornick']], 'Partitions an array into two arrays');
    this.done(1);
  });

  tests.addTest('sortBy', function () {
    this.deepEqual(Maddy.sortBy({
      'jdalton': ['John-David Dalton', 28],
      'ksgoncharov': ['Kit Goncharov', 17],
      'mcjalbert': ['Maddy Jalbert', 16]
    }, function (person) {
      return person[1];
    }), [['Maddy Jalbert', 16], ['Kit Goncharov', 17], ['John-David Dalton', 28]], '`sortBy` can sort a hash of names by age');
    this.done(1);
  });

  tests.addTest('groupBy', function () {
    this.deepEqual(Maddy.groupBy([1, 2, 3, 4, 5, 6], function (value) {
      return value % 2;
    }), {
      '0': [2, 4, 6],
      '1': [1, 3, 5]
    }, '`groupBy` should group the corresponding array values');
    this.done(1);
  });

  tests.addTest('first', function () {
    var lastIndex = -1;
    this.equal(Maddy.first([]), void 0, 'Works with an empty array');
    this.equal(Maddy.first([1, 2, 3]), 1, 'Returns the first element');
    this.equal(Maddy.first([2, 4, 6, 4, 8], function (value, index) {
      lastIndex = index;
      return value == 4;
    }), 4, 'Works with an optional iterator function');
    this.equal(lastIndex, 1, 'Returns the first matching value');
    this.deepEqual(Maddy.first([5, 10, 15], 2), [5, 10], 'Works with an optional index argument');
    this.deepEqual(Maddy.first([3, 5, 7, 9], 0), [], 'Returns an empty array if the index is `0`');
    this.equal(Maddy.first([1, 10], function (value) {
      return value == 5;
    }), void 0, 'Returns `undefined` if the iterator function does not match any values');
    this.equal(function () {
      return Maddy.first(arguments);
    }(4, 3, 2, 1), 4, '`arguments` object');
    this.done(8);
  });

  tests.addTest('last', function () {
    var lastIndex = -1;
    this.equal(Maddy.last([]), void 0, '`last` works with an empty array');
    this.equal(Maddy.last([1, 2, 3]), 3, 'Returns the last element');
    this.equal(Maddy.last([1, 1, 2, 3, 5, 8], function (value, index) {
      lastIndex = index;
      return value == 1;
    }), 1, 'Works with an optional iterator function');
    this.equal(lastIndex, 1, 'Returns the last matching value');
    this.deepEqual(Maddy.last([4, 16, 64], 2), [16, 64], 'Works with an optional index argument');
    this.deepEqual(Maddy.last([2, 4, 6], 0), [], 'Returns an empty array if the index is `0`');
    this.equal(Maddy.last([1, 7], function (value) {
      return value == 9;
    }), void 0, 'Returns `undefined` if the iterator function does not match any values');
    this.equal(function () {
      return Maddy.last(arguments);
    }(9, 8, 7), 7, '`arguments` object');
    this.done(8);
  });

  tests.addTest('compact', function () {
    this.deepEqual(Maddy.compact([0, null, 1, false, 2, void 0, 3]), [0, 1, false, 2, 3], '`compact` can remove `null` and `undefined` values');
    this.deepEqual(Maddy.compact(function () {
      return Maddy.compact(arguments);
    }(0, false, null, void 0, NaN, '')), [0, false, NaN, ''], 'Should remove `null` and `undefined` values only');
    this.done(2);
  });

  tests.addTest('flatten', function () {
    this.deepEqual(Maddy.flatten([1, [2], [3, [[4]]]]), [1, 2, 3, 4], '`flatten` can flatten nested arrays');
    this.deepEqual((function () {
      return Maddy.flatten(arguments);
    }(1, [2], [3, [[4]]])), [1, 2, 3, 4], '`arguments` object');
    this.done(2);
  });

  tests.addTest('without', function () {
    var elements = [{'one': 1}, {'two': 2}];
    this.deepEqual(Maddy.without([1, 2, 1, 0, 3, 1, 4], 0, 1), [2, 3, 4], '`without` returns an array that excludes the specified values');
    this.deepEqual((function () {
      return Maddy.without(arguments, 0, 1);
    }(1, 2, 1, 0, 3, 1, 4)), [2, 3, 4], '`arguments` object');
    this.deepEqual(Maddy.without(elements, {'one': 1}), elements, 'Identity should be used when comparing the values');
    this.done(3);
  });

  tests.addTest('unique', function () {
    this.deepEqual(Maddy.unique([1, 1, 1]), [1], '`unique` should return the unique values in an array');
    this.deepEqual(Maddy.unique([0, 1, 2, 2, 3, 0, 2]), [0, 1, 2, 3], '`unique` can find unique values in an unsorted array');
    this.deepEqual((function () {
      return Maddy.unique(arguments);
    }(1, 2, 1, 3, 1, 4)), [1, 2, 3, 4], '`arguments` object');
    this.done(3);
  });

  tests.addTest('intersect', function () {
    this.deepEqual(Maddy.intersect(['John-David', 'Kit', 'Maddy'], ['Kit', 'Maddy']), ['Kit', 'Maddy'], '`intersect` returns the union of two arrays');
    this.deepEqual(Maddy.intersect([1, '2', 3], [1, 2, 3]), [1, 3], 'Identity should be used in comparing the elements');
    this.deepEqual(Maddy.intersect([1, 1], [1, 1]), [1], 'An array with a single value should be returned if the elements are repeated');
    this.deepEqual(Maddy.intersect([1, 1, 3, 5], [4]), [], 'An empty array should be returned if the two sets contain different values');
    this.done(4);
  });

  tests.addTest('zip', function () {
    this.deepEqual(Maddy.zip(['Maddy', 'Kit', 'John-David'], [16, 17, 28], [true]), [['Maddy', 16, true], ['Kit', 17, void 0], ['John-David', 28, void 0]], '`zip` can merge arrays of different lengths');
    this.done(1);
  });

  tests.addTest('indexOf', function () {
    var numbers = [1, 2, 3], index;
    this.equal(Maddy.indexOf([1, 2, 3], 2), 1, '`indexOf` should return the index of an element in an array');
    this.equal((function () {
      return Maddy.indexOf(arguments, 5, 6);
    }(9, 8, 7, 6, 5, 5, 4, 5)), 7, '`arguments` object; optional `index` argument');
    this.equal(Maddy.indexOf([10, 20, 30, 40, 50], 35), -1, 'The specified value is not in the array');
    this.equal(Maddy.indexOf([90, 80, 70, 60, 40], 70), 2, 'The specified value is in the array');
    this.equal(Maddy.indexOf([1, 40, 40, 40, 40, 40, 40, 40, 50, 60, 70], 40), 1, 'The first occurrence of an element should be returned');
    this.done(5);
  });

  tests.addTest('lastIndexOf', function () {
    var numbers = [1, 0, 1, 0, 0, 1, 0, 0, 0];
    this.equal(Maddy.lastIndexOf(numbers, 1), 5, '`lastIndexOf` should return the last occurrence of an element in an array');
    this.equal(Maddy.lastIndexOf(numbers, 0, 6), 6, 'Optional `index` argument');
    this.equal((function () {
      return Maddy.lastIndexOf(arguments, 1);
    }(1, 0, 1, 0, 0, 1, 0, 0, 0)), 5, '`arguments` object');
    this.done(3);
  });

  tests.addTest('range', function () {
    this.deepEqual(Maddy.range(0), [], 'Passing `0` as the first argument should return an empty array');
    this.deepEqual(Maddy.range(4), [0, 1, 2, 3], 'Passing a single `last` argument should return an array of elements');
    this.deepEqual(Maddy.range(5, 8), [5, 6, 7], 'Passing two arguments, where `first < last`, should return an array of elements');
    this.deepEqual(Maddy.range(8, 5), [], 'Passing two arguments, where `first > last`, should return an empty array');
    this.deepEqual(Maddy.range(3, 10, 3), [3, 6, 9], 'Passing three arguments should create a range with the specified bounds and common difference');
    this.deepEqual(Maddy.range(3, 10, 15), [3], 'Passing an out-of-bounds difference argument should return a single-element array');
    this.deepEqual(Maddy.range(0, -10, -1), [0, -1, -2, -3, -4, -5, -6, -7, -8, -9], 'A negative difference argument should return a decreasing range');
    this.done(7);
  });

  tests.addTest('keys', function () {
    var exception = /TypeError/, object = Array(10);
    // Most browsers enumerate keys in the order in which they were defined,
    // though this behavior is unspecified in section 12.6.4 of the ECMAScript
    // spec.
    this.deepEqual(Maddy.keys({
      'jashkenas': 'Jeremy Ashkenas',
      'sstephenson': 'Sam Stephenson'
    }), ['jashkenas', 'sstephenson'], '`keys` should return an array of object properties');
    object.push(1);
    this.deepEqual(Maddy.keys(object), ['10'], 'A sparse array should contain only one key');
    this.error(function () { Maddy.keys(null); }, exception, '`null` should throw a `TypeError`');
    this.error(function () { Maddy.keys(); }, exception, '`undefined` should throw a `TypeError`');
    this.error(function () { Maddy.keys(1); }, exception, 'Number primitives should throw a `TypeError`');
    this.error(function () { Maddy.keys('Maddy'); }, exception, 'String primitives should throw a `TypeError`');
    this.error(function () { Maddy.keys(true); }, exception, 'Boolean primitives should throw a `TypeError`');
    this.done(7);
  });

  tests.addTest('values', function () {
    this.deepEqual(Maddy.values({
      'jdalton': 'John-David Dalton',
      'ksgoncharov': 'Kit Goncharov'
    }), ['John-David Dalton', 'Kit Goncharov'], '`values` should return an array of object property values');
    this.done(1);
  });

  tests.addTest('extend', function () {
    this.deepEqual(Maddy.extend({}, {'a': 'b'}), {'a': 'b'}, '`extend` can copy source properties to the target object');
    this.deepEqual(Maddy.extend({'a': 'x'}, {'a': 'b'}), {'a': 'b'}, 'Non-unique source properties should overwrite destination properties');
    this.deepEqual(Maddy.extend({'x': 'x'}, {'a': 'b'}), {'x': 'x', 'a': 'b'}, 'Unique source properties should be copied to the target object');
    this.deepEqual(Maddy.extend({'x': 'x'}, {'a': 'a', 'x': 2}, {'a': 'b'}), {'x': 2, 'a': 'b'}, 'The last defined property should be used when multiple source objects are provided');
    this.done(4);
  });

  tests.addTest('isEqual', function () {
    var kit = {
      'name': 'Kit Goncharov',
      'nickname': 'ksgoncharov',
      'lucky': [13, 27, 34]
    }, clone = {
      'name': 'Kit Goncharov',
      'nickname': 'ksgoncharov',
      'lucky': [13, 27, 34]
    };
    this.notEqual(kit, clone, 'Cloned objects are not identical');
    this.ok(Maddy.isEqual(kit, clone), '`isEqual` should perform a deep comparison');
    this.ok(!Maddy.isEqual(5, NaN), '`5` should not be equivalent to `NaN`');
    this.ok(Maddy.isEqual(NaN, NaN), '`NaN` should be equivalent to `NaN`');
    this.ok(Maddy.isEqual(new Date(100), new Date(100)), 'Identical date objects are equivalent');
    this.ok(Maddy.isEqual(/(?:)/gim, /(?:)/gim), 'Identical RegExps are equivalent');
    this.ok(!Maddy.isEqual(null, [1]), 'Falsy values are not equivalent to truthy values');
    this.ok(!Maddy.isEqual({'x': 1, 'y': void 0}, {'x': 1, 'z': 2}), 'Objects with identical keys but different values are not equivalent');
    this.done(8);
  });

  tests.addTest('isEmpty', function () {
    function Test() {}
    Test.prototype.toString = 1;

    this.ok(Maddy.isEmpty(null), '`null` should be empty');
    this.ok(Maddy.isEmpty(), '`undefined` should be empty');
    this.ok(!Maddy.isEmpty([1]), 'An array with one value should not be empty');
    this.ok(Maddy.isEmpty([]), 'An empty array literal should be empty');
    this.ok(!Maddy.isEmpty({'one': 1}), 'An object with one property should not be empty');
    this.ok(Maddy.isEmpty({}), 'An empty object literal should be empty');
    this.ok(!Maddy.isEmpty(/(?:)/), 'RegExps shoud not be empty');
    this.ok(!Maddy.isEmpty(new Date), 'Dates should not be empty');
    this.ok(!Maddy.isEmpty(false), 'Booleans should not be empty');
    this.ok(Maddy.isEmpty(new Test), 'Objects with no own properties should be empty');
    this.ok(Maddy.isEmpty(''), 'Empty strings should be empty');
    this.ok(!Maddy.isEmpty('John-David'), 'A string with a value should not be empty');

    var object = {'ksgoncharov': 'Kit Goncharov'};
    delete object.ksgoncharov;
    this.ok(Maddy.isEmpty(object), 'Deleting all own properties from an object should clear it');
    this.done(13);
  });

  tests.addTest('getClassOf', function () {
    this.equal(Maddy.getClassOf(null), 'Null', '`null` value');
    this.equal(Maddy.getClassOf(void 0), 'Undefined', '`undefined` value');
    this.equal(Maddy.getClassOf(function () {}), 'Function', 'Function object');
    this.equal(Maddy.getClassOf({}), 'Object', 'Object instance');
    this.equal(Maddy.getClassOf({
      'length': 0,
      'push': [].push,
      'splice': [].splice
    }), 'Object', 'Array-like object');
    this.equal(Maddy.getClassOf([]), 'Array', 'Array literal');
    this.equal(Maddy.getClassOf(/(?:)/), 'RegExp', 'RegExp literal');
    this.equal(Maddy.getClassOf('Kit'), 'String', 'String primitive');
    this.equal(Maddy.getClassOf(new Boolean(false)), 'Boolean', 'Boolean object');
    this.equal(Maddy.getClassOf(new Number(123)), 'Number', 'Number object');
    this.equal(Maddy.getClassOf(new Date), 'Date', 'Date object');
    this.done(11);
  });

  tests.addTest('times', function () {
    var length = 0;
    Maddy.times(10, function (value) {
      length += value;
    });
    this.equal(length, 45, '`times` should execute a callback multiple times');
    this.done(1);
  });

  // Run the tests.
  this.onload = function() {
    tests.run();
  };
}).call(this);