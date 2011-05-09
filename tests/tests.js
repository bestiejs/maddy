/*!
 * Maddy Unit Tests
 * http://github.com/kitgoncharov/maddy
 *
 * Utility methods inspired by QUnit.
 * http://github.com/jquery/qunit
*/

(function () {
  // Load Spec and Maddy.
  var Spec = this.Spec, Maddy = this.Maddy,

  // Convenience aliases.
  getClass = Object.prototype.toString, charAt = String.prototype.charAt,
  document = this.document,

  // Create the Maddy spec.
  tests = Maddy.tests = new Spec('Maddy Unit Tests'),

  // Matches control characters, double quotes, and the escape character.
  escapable = /[\x00-\x1f"\\]/g,

  // A hash of escape sequences for control characters.
  escapes = {
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '"': '\\"',
    '\\': '\\\\'
  };

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
  function stringify(value, stack) {
    var className = getClass.call(value), length, results, property, month, date, hours, minutes, seconds;
    // `null` and `undefined` are represented as such.
    if (value == null) return '' + value;
    switch (className) {
      // Double-quote strings and escape all control characters.
      case '[object String]':
        return '"' + escape(value) + '"';
      // Booleans and numbers are represented as such.
      case '[object Number]':
        return (value == 1 / 0) ? 'Infinity' : (value == -1 / 0) ? '-Infinity' : (value != value) ? 'NaN' : ('' + value);
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
          // Months, dates, hours, minutes, and seconds should have two digits; milliseconds should have three digits.
          return value.getUTCFullYear() + '-' + (month < 10 ? '0' + month : month) + '-' + (date < 10 ? '0' + date : date) + 'T' + (hours < 10 ? '0' + hours : hours) + ':' + (minutes < 10 ? '0' + minutes : minutes) + ':' + (seconds < 10 ? '0' + seconds : seconds) + '.' + ('000' + value.getUTCMilliseconds()).slice(-3) + 'Z';
        }
        return 'Invalid Date';
      // Avoid function decompilation.
      case '[object Function]':
        return (value.displayName || value.name || 'anonymous') + '()';
    }
    if (typeof value != 'object') return '{...}';
    // Inspect errors.
    if ('name' in value && 'message' in value) {
      property = value.message;
      return (value.name || 'Error') + (property ? ': ' + property : '');
    }
    // DOM elements and nodes.
    if ('nodeName' in value && 'nodeValue' in value && 'nodeType' in value) {
      // Based on work by Joseph Pecoraro and the WebKit Team.
      switch (+value.nodeType) {
        // Element nodes.
        case 1:
          // Wrap the result in angle brackets.
          results = ('<' + value.nodeName).toLowerCase();
          // Serialize the element's ID and class name.
          if (typeof (property = 'id' in value && value.id) == 'string' && property) results += ' id="' + escape(property) + '"';
          if (typeof (property = 'className' in value && value.className) == 'string' && property) results += ' class="' + escape(property) + '"';
          return results + '>';
        // Text nodes.
        case 3:
          property = value.nodeValue;
          return (property && charAt.call(property, 0)) ? escape(property) : '(whitespace)';
        // Comment nodes.
        case 8:
          property = value.nodeValue;
          return '<!--' + ((property && charAt.call(property, 0)) ? escape(property) : '(comment)') + '-->';
        // Document nodes.
        case 9:
          return 'Document';
        // DOCTYPEs.
        case 10:
          return '<!DOCTYPE>';
      }
      // Unrecognized node type.
      return '<...>';
    }
    // Ensure that the object has not already been traversed and compared.
    length = stack.length;
    while (length--) if (stack[length] == value) throw new TypeError('Cyclic structure.');
    // Recursively inspect arrays and objects.
    stack.push(value);
    results = [];
    if (className == '[object Array]') {
      length = value.length;
      // Inspect each element.
      while (length--) results[length] = stringify(value[length], stack);
      results = '[' + results.join(', ') + ']';
    } else {
      for (property in value) results.push('"' + escape(property) + '": ' + stringify(value[property], stack));
      results = '{' + results.join(', ') + '}';
    }
    // Once the object has been inspected, remove it from the stack.
    stack.pop();
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
          data.appendChild(document.createTextNode(stringify(event.expected, [])));
          expected.appendChild(data);
          message.appendChild(expected);
          // Format and show the actual value.
          actual = document.createElement('span');
          actual.className = 'actual';
          actual.appendChild(document.createTextNode('Actual: '));
          data = document.createElement('code');
          data.appendChild(document.createTextNode(stringify(event.actual, [])));
          actual.appendChild(data);
          message.appendChild(actual);
        }
        // Show the message.
        messages.appendChild(message);
    }
  });

  tests.addTest('forEach', function () {
    // ...
    this.done(0);
  });

  tests.addTest('map', function () {
    // ...
    this.done(0);
  });

  tests.addTest('reduce', function () {
    // ...
    this.done(0);
  });

  tests.addTest('reduceRight', function () {
    // ...
    this.done(0);
  });

  tests.addTest('some', function () {
    // ...
    this.done(0);
  });

  tests.addTest('filter', function () {
    // ...
    this.done(0);
  });

  tests.addTest('every', function () {
    // ...
    this.done(0);
  });

  tests.addTest('find', function () {
    // ...
    this.done(0);
  });

  tests.addTest('reject', function () {
    // ...
    this.done(0);
  });

  tests.addTest('include', function () {
    // ...
    this.done(0);
  });

  tests.addTest('invoke', function () {
    // ...
    this.done(0);
  });

  tests.addTest('pluck', function () {
    // ...
    this.done(0);
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
    // ...
    this.done(0);
  });

  tests.addTest('sortBy', function () {
    // ...
    this.done(0);
  });

  tests.addTest('groupBy', function () {
    // ...
    this.done(0);
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
    }(4, 3, 2, 1), 4, 'Works with an `arguments` object');
    this.done(8);
  });

  tests.addTest('last', function () {
    var lastIndex = -1;
    this.equal(Maddy.last([]), void 0, 'Works with an empty array');
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
    }(9, 8, 7), 7, 'Works with an `arguments` object');
    this.done(8);
  });

  tests.addTest('compact', function () {
    // ...
    this.done(0);
  });

  tests.addTest('flatten', function () {
    // ...
    this.done(0);
  });

  tests.addTest('without', function () {
    // ...
    this.done(0);
  });

  tests.addTest('unique', function () {
    // ...
    this.done(0);
  });

  tests.addTest('intersect', function () {
    // ...
    this.done(0);
  });

  tests.addTest('zip', function () {
    // ...
    this.done(0);
  });

  tests.addTest('indexOf', function () {
    // ...
    this.done(0);
  });

  tests.addTest('lastIndexOf', function () {
    // ...
    this.done(0);
  });

  tests.addTest('range', function () {
    // ...
    this.done(0);
  });

  tests.addTest('keys', function () {
    // ...
    this.done(0);
  });

  tests.addTest('values', function () {
    // ...
    this.done(0);
  });

  tests.addTest('extend', function () {
    // ...
    this.done(0);
  });

  tests.addTest('isEqual', function () {
    // ...
    this.done(0);
  });

  tests.addTest('isEmpty', function () {
    // ...
    this.done(0);
  });

  tests.addTest('getClassOf', function () {
    // ...
    this.done(0);
  });

  tests.addTest('times', function () {
    // ...
    this.done(0);
  });

  // Run the tests.
  this.onload = function() {
    tests.run();
  };
}).call(this);