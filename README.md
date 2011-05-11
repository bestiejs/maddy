Maddy
=====

**Maddy** is a functional programming library inspired by [Underscore](http://documentcloud.github.com/underscore/) and [FuseJS](http://www.fusejs.com/). It provides numerous iteration functions for arrays and objects, as well as additional utility methods for type checking and deep equality testing.

Maddy is environment and framework-agnostic, and is compatible with web browsers, [CommonJS](http://www.commonjs.org/) implementations, and JavaScript engines. It also provides consistent support for older, buggy environments.

The [annotated source code](http://kitgoncharov.github.com/maddy/docs/maddy.html) is available. Full documentation coming soon...

## Compatibility

Spec has been tested with the following web browsers, CommonJS environments, and JavaScript engines.

### Web Browsers

- Microsoft [Internet Explorer](http://www.microsoft.com/windows/internet-explorer) for Windows, version 5.5 and higher
- Mozilla [Firefox](http://www.mozilla.com/firefox), version 1.5 and higher
- Apple [Safari](http://www.apple.com/safari), version 2.0 and higher
- Google [Chrome](http://www.google.com/chrome), version 1.0 and higher
- [Opera](http://www.opera.com) 7.54 and higher
- [Mozilla](http://www.mozilla.org/projects/browsers.html) 1.7.2, [Netscape](http://browser.netscape.com/releases) 7.2, and [SeaMonkey](http://www.seamonkey-project.org/) 1.0 and higher
- [Konqueror](http://www.konqueror.org) 3.4.3 and higher

### CommonJS Environments

- [Node](http://nodejs.org/) 0.2.6 and higher
- [Narwhal](http://narwhaljs.org/) 0.3.2 and higher
- [RingoJS](http://ringojs.org/) 0.4 and higher

### JavaScript Engines

- Mozilla [SpiderMonkey](http://www.mozilla.org/js/spidermonkey), version 1.5.0 and higher
- Mozilla [Rhino](http://www.mozilla.org/rhino) 1.7R1 and higher
- WebKit [JSC](https://trac.webkit.org/wiki/JSC)
- Google [V8](http://code.google.com/p/v8)

## Contributing to Maddy

Check out a working copy of the Maddy source code with [Git](http://git-scm.com/):

    $ git clone git://github.com/kitgoncharov/maddy.git

If you'd like to contribute a feature or bug fix, you can [fork](http://help.github.com/forking/) Maddy, commit your changes, and [send a pull request](http://help.github.com/pull-requests/). Please make sure to update the unit tests in the `tests` directory as well.

Alternatively, you can use the [GitHub issue tracker](http://github.com/kitgoncharov/maddy/issues) to submit bug reports and feature requests.

### Coding Guidelines

In addition to the following [Prototype-inspired](http://prototypejs.org/contribute) guidelines, please follow the conventions already established in the code.

- **Spacing**: Use two spaces for indentation. No tabs.
- **Naming**: Keep variable and method names concise but descriptive. `index` and `callback` are preferable to `i` and `fn`.
- **Comments**: Significant changes and new methods should be annotated with comments.
- **Lint**: Make sure that your changes pass [JavaScript Lint](http://javascriptlint.com/). A configuration file is included in the repository; to check the source code for problems, run `jsl -conf jsl.conf` from the command line.

## MIT License

Copyright &copy; 2011 [Kit Goncharov](http://kitgoncharov.github.com).

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.