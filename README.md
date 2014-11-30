Swift Browser
=============

[![Build Status](https://travis-ci.org/zerovm/swift-browser.svg?branch=master)](https://travis-ci.org/zerovm/swift-browser)
[![Coverage Status](https://codecov.io/github/zerovm/swift-browser/coverage.svg?branch=master)](https://codecov.io/github/zerovm/swift-browser?branch=master)

JavaScript based UI for [OpenStack Swift][]. You can
[**try our demo**][demo] if you want to see how it looks and behaves.


Deployment
==========

Deployment is simple: if you got this file from a release tarball or
zip file, then you simply need to upload all files in this folder to
Swift. That will look like this:

    $ swift post swift-browser
    $ swift post -r '.r:*' swift-browser
    $ swift upload swift-browser .

Then load the `index.html` page in your browser. You will be asked for
your credentials if needed. After logging in, you will see a container
listing. Deployment is now done.

If you cloned the repository you need to install dependencies before
you can deploy Swift Browser. These are managed using [Bower][]. You
can run Bower via [npm][]:

    $ npm install

This will install Bower and other tools needed in the `node_modules`
folder (everything is installed locally). It will then run `bower
install` for you to download AngularJS and other libraries needed.

When the command is done, the `app/` folder will be ready for upload.
Simply upload it to your Swift installation and load the `index.html`
page in your browser (use the instructions above).


Configuration
=============

You can add a configuration file named `config.json` to configure the
authentication type and URL endpoint. The default is to authenticate
using [LiteAuth][]:

    {
        "auth": {
            "type": "liteauth",
            "url": "/auth/v1.0"
        }
    }

For authentication against Keystone, you should configure Swift
Browser like this:

    {
        "auth": {
            "type": "keystone",
            "url": "http://localhost:5000/v2.0/tokens"
        }
    }


Same-Origin Restrictions
========================

For Swift Browser to do Keystone authentication, you will need to make
sure that the browser can send AJAX requests to Keystone. Typically,
Swift will be running on one port number with Keystone running on a
different port number. The same-origin restrictions in browsers forbid
JavaScript from making AJAX calls between different hosts.

So to make Swift Browser talk to Keystone, you need to either

* Make the two servers run on the same origin as seen from the
  browser.

  This can be done by installing a proxy infront of both Keystone and
  Swift. The proxy can then expose Swift under
  `http://example.net/swift` and Keystone under
  `http://example.net/keystone`. This will allow JavaScript code
  loaded from `/swift` to send AJAX requests to `/keystone` without
  problem.

* Install and enable a [CORS (cross-origin resource sharing)][cors]
  middleware for Keystone.

  CORS is a standard for allowing scripts on one origin domain access
  resources in another origin. You basically configure Keystone to
  allow API requests from the origin where Swift is running (or from
  any origin). Please see this [blog post][swift-cors] for details.


Testing
=======

For testing purposes, you can try the browser with a simulated Swift
backend. Run

    $ grunt mock start

to generate `app/mock.html` and also start the development web server.
Loading

    http://localhost:8000/app/mock.html

in your browser will now show the mocked test environment. You will be
working on an in-memory database which reflects the changes you make
until you reload the page. Navigating using the in-page links is okay
since that doesn't trigger a full page reload.


Supported Browsers
==================

We support IE 10+ and test with Firefox and Chrome.


Release History
===============

Version 0.2.0: 2014-11-17
-------------------------

This release adds support for copying objects and deleting containers.
Furthermore, the JavaScript and CSS files are now concatenated and
minified, resulting in a faster load. Issues closed since 0.1.0:

* [#176][]: Fix Bootstrap fonts missing in minified build.
* [#164][]: Run E2E tests on minified JavaScript.
* [#163][]: Test page speed using online tools.
* [#157][]: Use grunt-usemin to concat and minimize assets.
* [#155][]: Use load-grunt-tasks to simplify Gruntfile
* [#154][]: Use grunt-contrib-compress to create release tarball and
  zip file.
* [#120][]: Look at using a CDN for third-party dependencies.
* [#95][]: Concatenate HTML templates into a single file for
  production deployment.
* [#53][]: Implement copy operation.
* [#37][]: Add support for deleting containers.
* [#20][]: Look at using ng-annotate.

Version 0.1.0: 2014-11-06
-------------------------

First release with a basic feature set:

* Keystone and LiteAuth authentication.
* Can browse containers and pseudo-directories.
* Can create and delete containers.
* Can edit object content and metadata.
* Can upload and delete objects.


Other Swift File Managers
=========================

* [Swift Explorer][]: implemented in Java.
* [django-swiftbrowser][]: implemented in Python using Django.
* [swift-ui][]: implemented in JavaScript using Backbone.js

[OpenStack Swift]: http://docs.openstack.org/developer/swift/
[demo]: http://www.zerovm.org/swift-browser/
[Bower]: http://bower.io/
[npm]: https://www.npmjs.org/
[LiteAuth]: https://github.com/zerovm/liteauth
[cors]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Access_control_CORS
[swift-cors]: http://blog.yunak.eu/2013/07/24/keystone_cors/
[Swift Explorer]: http://www.619.io/swift-explorer
[django-swiftbrowser]: https://github.com/cschwede/django-swiftbrowser
[swift-ui]: https://github.com/fanatic/swift-ui

[#176]: https://github.com/zerovm/swift-browser/issues/176
[#164]: https://github.com/zerovm/swift-browser/issues/164
[#163]: https://github.com/zerovm/swift-browser/issues/163
[#157]: https://github.com/zerovm/swift-browser/issues/157
[#155]: https://github.com/zerovm/swift-browser/issues/155
[#154]: https://github.com/zerovm/swift-browser/issues/154
[#120]: https://github.com/zerovm/swift-browser/issues/120
[#95]: https://github.com/zerovm/swift-browser/issues/95
[#53]: https://github.com/zerovm/swift-browser/issues/53
[#37]: https://github.com/zerovm/swift-browser/issues/37
[#20]: https://github.com/zerovm/swift-browser/issues/20
