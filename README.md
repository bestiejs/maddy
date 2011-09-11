Maddy
=====

**Maddy** is a functional object operations library. It provides various [higher-order functions](http://en.wikipedia.org/wiki/Higher-order_function) for manipulating object members, as well as utility methods for determining deep equality, checking object types, and recursively inspecting objects. All recursive methods fully support cyclic structures.

Maddy is directly inspired by [Functional](http://osteele.com/sources/javascript/functional/), [Underscore](http://documentcloud.github.com/underscore/), and Ruby's [Enumerable](http://www.ruby-doc.org/core/classes/Enumerable.html) module, and philosophically by the [FuseJS](http://fusejs.com/) project.

The library is framework-agnostic, and is compatible with web browsers, [CommonJS](http://www.commonjs.org/) environments, JavaScript engines, and asynchronous script loaders. It also normalizes infamous bugs present in older environments, such as Internet Explorer 6 and Safari 2.

## Downloads

The **development** version is commented and uncompressed; the **production** version has been compressed using [Closure Compiler](http://closure-compiler.appspot.com/home) with [advanced optimizations](http://code.google.com/closure/compiler/docs/api-tutorial3.html) enabled.

- [Development Version](http://kitcambridge.github.com/maddy/lib/maddy.js)
- [Production Version](http://kitcambridge.github.com/maddy/lib/maddy.min.js)

If you're a [Node](http://nodejs.org/) user, Maddy is available on [npm](http://npmjs.org/):

    $ {sudo} npm install {-g} maddy

The [annotated source code](http://kitcambridge.github.com/maddy/docs/index.html) is available for your perusal.

## Compatibility

Maddy has been **tested** with the following web browsers, CommonJS environments, and JavaScript engines.

### Web Browsers

- Windows [Internet Explorer](http://www.microsoft.com/windows/internet-explorer), version 6.0 and higher
- Mozilla [Firefox](http://www.mozilla.com/firefox), version 1.5 and higher
- Apple [Safari](http://www.apple.com/safari), version 2.0 and higher
- Google [Chrome](http://www.google.com/chrome), version 1.0 and higher
- [Opera](http://www.opera.com) 7.54 and higher
- [Mozilla](http://www.mozilla.org/projects/browsers.html) 1.7.2, [Netscape](http://browser.netscape.com/releases) 7.2, and [SeaMonkey](http://www.seamonkey-project.org/) 1.0 and higher

### CommonJS Environments

- Node 0.2.6 and higher
- [Narwhal](http://narwhaljs.org/) 0.3.2 and higher
- [RingoJS](http://ringojs.org/) 0.4 and higher

### JavaScript Engines

- Mozilla [SpiderMonkey](http://www.mozilla.org/js/spidermonkey), version 1.5.0 and higher
- Mozilla [Rhino](http://www.mozilla.org/rhino) 1.7R1 and higher
- WebKit [JSC](https://trac.webkit.org/wiki/JSC)
- Google [V8](http://code.google.com/p/v8)

## Contributing to Maddy

Check out a working copy of the Maddy source code with [Git](http://git-scm.com/):

    $ git clone git://github.com/kitcambridge/maddy.git

If you'd like to contribute a feature or bug fix, you can [fork](http://help.github.com/forking/) Maddy, commit your changes, and [send a pull request](http://help.github.com/pull-requests/). Please make sure to update the unit tests in the `tests` directory as well.

Alternatively, you can use the [GitHub issue tracker](http://github.com/kitcambridge/maddy/issues) to submit bug reports and feature requests.

### Unit Tests

Maddy uses the [Spec](http://github.com/kitcambridge/spec) unit testing framework. The unit tests are written in [Coco](http://satyr.github.com/coco/), a self-hosting [CoffeeScript](http://coffeescript.org/) dialect that compiles to JavaScript. **Coco reduces the syntactic noise and idiomatic verbosity inherent in writing unit tests for a functional programming library**.

Coco can be [installed](http://github.com/satyr/coco#readme) via npm or Git. Once you've installed the compiler, run `coco -wc tests/tests.co` from the command line to watch and automatically recompile the unit tests as you modify them.

### Coding Guidelines

In addition to the following [Prototype-inspired](http://prototypejs.org/contribute) guidelines, please follow the conventions already established in the code.

- **Spacing**: Use two spaces for indentation. No tabs.
- **Naming**: Keep variable and method names concise but descriptive. `index` and `callback` are preferable to `i` and `fn`.
- **Functions**: Use [named function declarations](http://kangax.github.com/nfe/) to aid in debugging. Avoid anonymous functions and named function expressions.
- **Comments**: Significant changes and new methods should be annotated with comments.
- **Lint**: Make sure that your changes pass [JavaScript Lint](http://javascriptlint.com/). A configuration file is included in the repository; to check the source code for problems, run `jsl -conf jsl.conf`.

## MIT License

Copyright &copy; 2011 [Kit Cambridge](http://kitcambridge.github.com/).

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.