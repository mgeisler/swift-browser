Swift Browser
=============

[![Build Status](https://travis-ci.org/zerovm/swift-browser.svg?branch=master)](https://travis-ci.org/zerovm/swift-browser)
[![Coverage Status](https://img.shields.io/coveralls/zerovm/swift-browser.svg)](https://coveralls.io/r/zerovm/swift-browser)

JavaScript based UI for [OpenStack Swift][].

Deployment
----------

To deploy the Swift browser, you first need to pull in the
dependencies. These are managed using [Bower][], as client-side
dependency manager. You run Bower via [npm][]:

    $ npm install

This will install Bower and other tools needed in the `node_modules`
folder (everything is installed locally). It will then run `bower
install` for you to download AngularJS and other libraries needed.

When the command is done, the `app/` folder will be ready for upload.
Simply upload it to your Swift installation and load the `index.html`
page in your browser. Provided you have read access to Swift, you
should see a container listing and be able to browse the containers
and pseudo-directories.

Supported Browsers
------------------

We support IE 10+ and test with Firefox and Chrome.


Other Swift File Managers
-------------------------

* [Swift Explorer][]: implemented in Java.

* [django-swiftbrowser][]: implemented in Python using Django.

* [swift-ui][]: implemented in JavaScript using Backbone.js

[OpenStack Swift]: http://docs.openstack.org/developer/swift/
[Bower]: http://bower.io/
[npm]: https://www.npmjs.org/
[Swift Explorer]: http://www.619.io/swift-explorer
[django-swiftbrowser]: https://github.com/cschwede/django-swiftbrowser
[swift-ui]: https://github.com/fanatic/swift-ui
