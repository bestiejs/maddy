/*!
 * Spec unit testing library
 * http://github.com/kitgoncharov/Spec
 *
 * Copyright 2011, Kit Goncharov
 * http://kitgoncharov.github.com
 *
 * Released under the MIT License.
*/

(function() {
  // Convenience aliases.
  var getClass = {}.toString;

  // Specs
  // -----

  // Specs are event-driven collections of unit tests. Using custom events, you can
  // create routines for setting up and tearing down tests, handlings assertions and
  // failures, and logging test results.

  // The `Spec` constructor creates a new spec, with an optional `name`.
  function Spec(name) {
    Events.call(this);
    this.name = name == null ? 'Anonymous Spec' : name;
    this.length = 0;
  }

  // The current version of the library. Keep in sync with `package.json`.
  Spec.version = '1.0.0';

  // Add support for custom events.
  Spec.prototype = new Events;
  Spec.prototype.constructor = Spec;

  // Adds a `test` function to the spec. The `name is optional.
  Spec.prototype.add = function(name, test) {
    this[this.length++] = new Test(name, test);
    return this;
  };

  // Executes the spec.
  Spec.prototype.run = function() {
    // Create the spec summary.
    var spec = this, test,
    index = spec.assertions = spec.failures = 0,
    length = spec.length;
    // Internal event handler invoked every time a test triggers an event.
    function onEvent(event) {
      var target = event.target;
      // Proxy the triggered event.
      spec.trigger(event);
      switch (event.type) {
        // Update the spec summary.
        case 'assertion':
          return ++spec.assertions;
        case 'failure':
          return ++spec.failures;
        case 'teardown':
          // Unbind the internal event handler.
          target.unbind('all', onEvent);
          do {
            if (++index in spec && (target = spec[index])) {
              return target.bind('all', onEvent).run();
            } else if (index > length) {
              return spec.trigger('complete');
            }
          } while (true);
      }
    }
    // Begin running the unit tests.
    spec.trigger('start');
    do {
      if (index in spec && (test = spec[index])) {
        // Bind the internal event handler to the first test.
        test.bind('all', onEvent).run();
        break;
      } else if (index >= length) {
        // Finish running the spec.
        spec.trigger('complete');
        break;
      }
    } while (++index < length);
    return spec;
  };

  // Custom Events
  // -------------

  // `Spec.Events` contains methods for manipulating and triggering custom events. You
  // can `bind` and `unbind` event handlers; `trigger`ing an event executes its
  // handlers in succession.

  // The `Spec.Events` constructor creates a new event target.
  Spec.Events = Events;
  function Events() {
    this.events = {};
  }

  // Binds a `callback` function to an `event`. The `callback` will be invoked
  // whenever the `event`, specified by a string identifier, is triggered. `callback`s
  // bound to the special `all` event will be invoked for **all** triggered events.
  Events.prototype.bind = function(event, callback) {
    // Add the event handler to the handler registry.
    (this.events[event] || (this.events[event] = [])).push(callback);
    return this;
  };

  // Binds a one-time `callback` function to an `event`. The `callback` is invoked only
  // the first time the event is `trigger`ed, after which it is removed.
  Events.prototype.one = function(event, callback) {
    var target = this, onEvent = function(data) {
      target.unbind(event, onEvent);
      return callback.call(target, data);
    };
    return target.bind(event, onEvent);
  };

  // Removes a previously-bound event `callback`. If the `callback` function is
  // omitted, all `callback`s for the event `type` will be removed. If both the
  // `event` and `callback` are omitted, **all** event `callback`s will be removed.
  Events.prototype.unbind = function(event, callback) {
    var callbacks, length;
    if (event == null && callback == null) {
      // Remove all event handlers.
      this.events = {};
    } else if (event && (callbacks = this.events[event]) && (length = callbacks.length)) {
      // Remove the event handler from the handler registry.
      if (callback) while (length--) if (callbacks[length] == callback) callbacks.splice(length, 1);
      // Empty handler registry or omitted listener; remove the registry.
      if (callback == null || !callbacks.length) delete this.events[event];
    }
    return this;
  };

  // Triggers an `event`, specified by either a string identifier or an event object
  // with a `type` property.
  Events.prototype.trigger = function(event) {
    var callbacks, callback, index;
    // Covert a string identifier into an event object.
    if (typeof event == 'string') event = {
      'type': event
    };
    // Capture a reference to the current event target.
    if (!('target' in event)) event.target = this;
    if ((callbacks = this.events[event.type])) {
      // Clone the event handler registry.
      callbacks = callbacks.slice(0);
      // Execute each handler.
      index = 0;
      // Prevent subsequent handlers from firing if the handler explicitly returns
      // `false`.
      while ((callback = callbacks[index++])) if (callback.call(this, event) === false) break;
    }
    // Trigger the special `all` event.
    if (event.type != 'all' && (callbacks = this.events.all)) {
      callbacks = callbacks.slice(0);
      index = 0;
      while ((callback = callbacks[index++])) if (callback.call(this, event) === false) break;
    }
    return this;
  };

  // Tests
  // -----

  // Recursively compares two objects. Based on work by Jeremy Ashkenas, Philippe Rathe,
  // and Mark Miller.
  function eq(left, right, stack) {
    var className, property, result, size, sizeRight;
    // Identical objects are equivalent. Note: `0 === -0`, but they aren't equal.
    if (left === right) return left != 0 || 1 / left == 1 / right;
    // A strict comparison is necessary because `null == undefined`.
    if (left == null) return left === right;
    // Compare `[[Class]]` names (see the ECMAScript 5 spec, section 15.2.4.2).
    className = getClass.call(left);
    if (className != getClass.call(right)) return false;
    switch (className) {
      // Compare strings, numbers, dates, and booleans by value.
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent.
        return '' + left == '' + right;
      case '[object Number]':
      case '[object Date]':
      case '[object Boolean]':
        left = +left;
        right = +right;
        // `NaN`s are non-reflexive.
        return left != left ? right != right : left == right;
      // Equivalent regular expressions must have identical source patterns and flags.
      case '[object RegExp]':
        return left.source == right.source && left.global == right.global && left.multiline == right.multiline && left.ignoreCase == right.ignoreCase;
      // Equivalent functions must reference the same object.
      case '[object Function]':
        return left == right;
    }
    // Recursively compare objects and arrays.
    if (typeof left != 'object') return false;
    // Assume equality for cyclic structures.
    size = stack.length;
    while (size--) if (stack[size] == left) return true;
    // Add the object to the stack of traversed objects.
    stack.push(left);
    result = true;
    size = sizeRight = 0;
    if (className == '[object Array]') {
      // Compare array lengths to determine if a deep comparison is necessary.
      size = left.length;
      result = size == right.length;
      if (result) while (size--) if (size in left && !(result = size in right && eq(left[size], right[size], stack))) break;
    } else {
      for (property in left) {
        // Count the expected number of properties.
        ++size;
        // Deep compare each object member.
        if (!(result = property in right && eq(left[property], right[property], stack))) break;
      }
      // Ensure that both objects contain the same number of properties.
      if (result) {
        // Break as soon as the expected property count is greater.
        for (property in right) if (++sizeRight > size) break;
        result = size == sizeRight;
      }
    }
    // Remove the object from the traversed object stack.
    stack.pop();
    return result;
  }

  // The `Spec.Test` constructor wraps a `test` function with several convenience
  // methods and assertions. The `name` is optional.
  Spec.Test = Test;
  function Test(name, test) {
    if (name && test == null) {
      test = name;
      name = null;
    }
    Events.call(this);
    this.name = name || 'Anonymous Test';
    this.test = test;
    // Bind the helper event handler.
    this.bind('all', this.onEvent);
  }

  // Add support for custom events.
  Test.prototype = new Events;
  Test.prototype.constructor = Test;

  // Runs the test.
  Test.prototype.run = function() {
    this.trigger('setup');
    // Pass the wrapper as the first argument to the test function.
    this.test(this);
    return this;
  };

  // Tests whether `expression` is truthy. The optional assertion `message` defaults to
  // the name of the current assertion (e.g., `ok`).
  Test.prototype.ok = function(expression, message) {
    var event = {
      'actual': expression,
      'expected': true,
      'message': message || 'ok'
    };
    // Note: To test for the boolean `true`, use the `strictEqual` assertion.
    event.type = expression ? 'assertion' : 'failure';
    return this.trigger(event);
  };

  // Tests whether `actual` is **equal** to `expected`, as determined by the `==`
  // operator.
  Test.prototype.equal = function(actual, expected, message) {
    var event = {
      'actual': actual,
      'expected': expected,
      'message': message == null ? 'equal' : message
    };
    event.type = actual == expected ? 'assertion' : 'failure';
    return this.trigger(event);
  };

  // Tests for **loose** or coercive inequality (`actual != expected`).
  Test.prototype.notEqual = function(actual, expected, message) {
    var event = {
      'actual': actual,
      'expected': expected,
      'message': message == null ? 'notEqual' : message
    };
    event.type = actual != expected ? 'assertion' : 'failure';
    return this.trigger(event);
  };

  // Tests for **strict** equality (`actual === expected`).
  Test.prototype.strictEqual = function(actual, expected, message) {
    var event = {
      'actual': actual,
      'expected': expected,
      'message': message == null ? 'strictEqual' : message
    };
    event.type = actual === expected ? 'assertion' : 'failure';
    return this.trigger(event);
  };

  // Tests for **strict** inequality (`actual !== expected`).
  Test.prototype.notStrictEqual = function(actual, expected, message) {
    var event = {
      'actual': actual,
      'expected': expected,
      'message': message == null ? 'notStrictEqual' : message
    };
    event.type = actual !== expected ? 'assertion' : 'failure';
    return this.trigger(event);
  };

  // Tests for deep equality and equivalence, as determined by the `eq` function.
  Test.prototype.deepEqual = function(actual, expected, message) {
    var event = {
      'actual': actual,
      'expected': expected,
      'message': message == null ? 'deepEqual' : message
    };
    event.type = eq(actual, expected, []) ? 'assertion' : 'failure';
    return this.trigger(event);
  };

  // Tests for deep inequality.
  Test.prototype.notDeepEqual = function(actual, expected, message) {
    var event = {
      'actual': actual,
      'expected': expected,
      'message': message == null ? 'notDeepEqual' : message
    };
    event.type = eq(actual, expected, []) ? 'failure' : 'assertion';
    return this.trigger(event);
  };

  // Ensures that the `callback` function throws an exception. Both `expected` and
  // `message` are optional; if the `message` is omitted and `expected` is not a
  // RegExp or validation function, the `expected` value is used as the message.
  Test.prototype.error = function(callback, expected, message) {
    var ok = false, isRegExp = expected && getClass.call(expected) == '[object RegExp]',
    isFunction = !isRegExp && typeof expected == 'function';
    // Invalid expected value; the message was passed as the second argument.
    if (!isFunction && !isRegExp && message == null) {
      message = expected;
      expected = null;
    }
    try {
      callback();
    } catch (exception) {
      ok = expected == null || (isRegExp && expected.test(exception.name || exception.message)) || (isFunction && expected.call(this, exception, this));
    }
    return this.ok(ok, message == null ? 'error' : message);
  };

  // Ensures that the `callback` function does not throw any exceptions.
  Test.prototype.noError = function(callback, message) {
    var ok = true;
    try {
      callback();
    } catch (exception) {
      ok = false;
    }
    return this.ok(ok, message == null ? 'noError' : message);
  };

  // An event handler invoked every time a test triggers an event. Used for logging.
  Test.prototype.onEvent = function(event) {
    switch (event.type) {
      case 'setup':
        return (this.assertions = this.failures = this.errors = 0);
      case 'assertion':
        return ++this.assertions;
      case 'failure':
        return ++this.failures;
      case 'teardown':
        var expected = event.expected;
        // Verify that the expected number of assertions were executed.
        if (typeof expected == 'number' && expected != this.assertions) this.trigger({
          'type': 'failure',
          'actual': this.assertions,
          'expected': expected,
          'message': 'done'
        });
    }
  };

  // Completes a test with an optional expected number of `assertions`. This method
  // **must** be called at the end of each test.
  Test.prototype.done = function(assertions) {
    return this.trigger({
      'type': 'teardown',
      'expected': assertions
    });
  };

  // Expose the `Spec` constructor.
  this.Spec = Spec;
}).call(typeof this.exports == 'object' && this.exports || this);