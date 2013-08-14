Bootstrap Tokenfield
====================

A jQuery tagging / tokenizer input plugin for Twitter's Bootstrap, by the guys from [Sliptree](https://sliptree.com)

Check out the [demo and docs](http://sliptree.github.io/bootstrap-tokenfield/)

### Usage
	
	$('input').tokenfield()

### Features

* Copy & paste tokens with Ctrl+C and Ctrl+V
* Keyboard navigation, delete tokens with keyboard (arrow keys, Shift + arrow keys)
* Select specific tokens with Ctrl + click and Shift + click

### Changelog

0.7.1 

* Fixed: pressing comma did not create a token in Firefox
* Fixed: tokenfield('getTokensList') returned array instead of string

0.7.0 Autocompleted

* New feature: jQuery UI Autocomplete support

0.6.7 Crossable

* Fixed: Firefox close icon was misplaced
* New: IE 8-10 support (both CSS and Javascript)

0.6.5 Shiftable

* New feature: select specific tokens with Ctrl/Shift + click
* New feature: select specific tokens with Shift + arrow keys
* Internal API improvements

0.6 Editable

* New feature: Edit existing tokens by double-clicking or pressing enter
* A lot of improvements and bugfixes

0.5 Initial release