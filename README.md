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
* Twitter Typeahead and jQuery UI Autocomplete support

### Changelog

0.10.0

* Fixed: Entering a duplicate token does not submit the underlying form anymore
* Fixed: Selecting a duplicate token from autocomplete or typeahead suggestions no longer clears the input
* Improved: Trying to enter a duplicate tag now animates the existing tag for a little while
* Improved: Tokenfield input has now `autocomplete="off"` to prevent browser-specific autocomplete suggestions
* Changed: `triggerKeys` has been renamed to `delimiter` and accepts a single or an array of characters instead of character codes.

0.9.9-1

* Fixed: setTokens now respects `triggerKeys` option

0.9.8 

* New: `triggerKeys` option
* Fixed: Long placeholders are not being cut off anymore when initializing tokenfield with no tokens #37
* Fixed: createTokensOnBlur no more breaks token editing #35

0.9.7 Valuable

* Fixed: Twitter Typeahead valueKey support #18
* Fixed: Removing multiple tokens returned wrong data #30
* Fixed: If token is removed in beforeEdit event, no longer falls over #27, #28
* Fixed: Change event was triggered on initialization #22
* Fixed: When token is removed in beforeCreateToken event, no longer tries to create a token
* Fixed: Pressing comma key was not handled reliably
* New: `prevetDuplicateToken` event
* Improved: Typeahead integration
* Improved: styling
* Minor tweaks, fixes, improvements 

0.9.5 Typeable

* New: Twitter Typeahead support
* New: When triggering 'change' event on original input, setTokens is now called. This allows you to update tokens externally.
* Fixed: Nnput labels did not work with tokenfield
* Fixed: Set correct input width on fixed-width inputs

0.9.2 Maintenance release

* Many small fixes and improvements

0.9.0 Bootstrappable

* New: Bootstrap 3 support
* New: Input group support
* New: Disable/enable tokenfield
* New: Tokenfield is now responsive
* Deprecated: Bootstrap 2 support

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