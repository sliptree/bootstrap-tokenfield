/* ============================================================
 * bootstrap-tokenfield.js v0.10.0
 * ============================================================
 *
 * Copyright 2013 Sliptree
 * ============================================================ */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery'], factory);
  } else {
    root.Tokenfield = factory(root.jQuery);
  }
}(this, function ($) {

  "use strict"; // jshint ;_;

 /* TOKENFIELD PUBLIC CLASS DEFINITION
  * ============================== */

  var Tokenfield = function (element, options) {
    var _self = this

    this.$element = $(element)
    
    // Extend options
    this.options = $.extend({}, $.fn.tokenfield.defaults, { tokens: this.$element.val() }, options)
    
    // Setup delimiters and trigger keys
    this._delimiters = (typeof this.options.delimiter === 'string') ? [this.options.delimiter] : this.options.delimiter
    this._triggerKeys = $.map(this._delimiters, function (delimiter) {
      return delimiter.charCodeAt(0);
    });

    // Store original input width
    var elRules = (typeof window.getMatchedCSSRules === 'function') ? window.getMatchedCSSRules( element ) : null
      , elStyleWidth = element.style.width
      , elCSSWidth
      , elWidth = this.$element.width()

    if (elRules) {
      $.each( elRules, function (i, rule) {
        if (rule.style.width) {
          elCSSWidth = rule.style.width;
        }
      });
    }

    // Move original input out of the way
    this.$element.css({
      'position': 'absolute',
      'left': '-10000px'
    }).prop('tabindex', -1);

    // Create a wrapper
    this.$wrapper = $('<div class="tokenfield form-control" />')
    if (this.$element.hasClass('input-lg')) this.$wrapper.addClass('input-lg')
    if (this.$element.hasClass('input-sm')) this.$wrapper.addClass('input-sm')

    // Create a new input
    var id = this.$element.prop('id') || new Date().getTime() + '' + Math.floor((1 + Math.random()) * 100)
    this.$input = $('<input type="text" class="token-input" autocomplete="off" />')
                    .appendTo( this.$wrapper )
                    .prop( 'placeholder',  this.$element.prop('placeholder') )
                    .prop( 'id', id + '-tokenfield' )

    // Re-route original input label to new input
    var $label = $( 'label[for="' + this.$element.prop('id') + '"]' )
    if ( $label.length ) {
      $label.prop( 'for', this.$input.prop('id') )
    }

    // Set up a copy helper to handle copy & paste
    this.$copyHelper = $('<input type="text" />').css({
      'position': 'absolute',
      'left': '-10000px'
    }).prop('tabindex', -1).prependTo( this.$wrapper )
    
    // Set wrapper width
    if (elStyleWidth) {
      this.$wrapper.css('width', elStyleWidth);
    }
    else if (elCSSWidth) {
      this.$wrapper.css('width', elCSSWidth);
    }
    // If input is inside inline-form with no width set, set fixed width
    else if (this.$element.parents('.form-inline').length) {
      this.$wrapper.width( elWidth )
    }

    // Set tokenfield disabled, if original or fieldset input is disabled
    if (this.$element.prop('disabled') || this.$element.parents('fieldset[disabled]').length) {
      this.disable();
    }

    // Set up mirror for input auto-sizing
    this.$mirror = $('<span style="position:absolute; top:-999px; left:0; white-space:pre;"/>');
    this.$input.css('min-width', this.options.minWidth + 'px')
    $.each([
        'fontFamily', 
        'fontSize', 
        'fontWeight', 
        'fontStyle', 
        'letterSpacing', 
        'textTransform', 
        'wordSpacing', 
        'textIndent'
    ], function (i, val) {
        _self.$mirror[0].style[val] = _self.$input.css(val);
    });
    this.$mirror.appendTo( 'body' )

    // Insert tokenfield to HTML
    this.$wrapper.insertBefore( this.$element )
    this.$element.prependTo( this.$wrapper )

    // Calculate inner input width
    this.update()
    
    // Create initial tokens, if any
    this.setTokens(this.options.tokens, false, false)

    // Start listening to events
    this.listen()

    // Initialize autocomplete, if necessary
    if ( ! $.isEmptyObject( this.options.autocomplete ) ) {
      var autocompleteOptions = $.extend({}, this.options.autocomplete, {
        minLength: this.options.showAutocompleteOnFocus ? 0 : null,
        position: { my: "left top", at: "left bottom", of: this.$wrapper }
      })
      this.$input.autocomplete( autocompleteOptions )
    }

    // Initialize typeahead, if necessary
    if ( ! $.isEmptyObject( this.options.typeahead ) ) {
      var typeaheadOptions = $.extend({}, this.options.typeahead, {})
      this.$input.typeahead( typeaheadOptions )
      this.typeahead = true
    }
  }

  Tokenfield.prototype = {

    constructor: Tokenfield

  , createToken: function (attrs, triggerChange) {
      if (typeof attrs === 'string') {
        attrs = { value: attrs, label: attrs }
      }

     if (typeof triggerChange === 'undefined') {
         triggerChange = true
     }
      
      var _self = this
        , value = $.trim(attrs.value)
        , label = attrs.label.length ? $.trim(attrs.label) : value

      if (!value.length || !label.length || value.length < this.options.minLength) return

      if (!this.options.allowDuplicates && $.grep(this.getTokens(), function (token) {
        return token.value === value
      }).length) {
        // Allow listening to when duplicates get prevented
        var duplicateEvent = $.Event('preventDuplicateToken')
        duplicateEvent.token = {
          value: value,
          label: label
        }
        this.$element.trigger( duplicateEvent )
        // Add duplicate warning class to existing token for 250ms
        var duplicate = this.$wrapper.find( '.token[data-value="' + value + '"]' ).addClass('duplicate')
        setTimeout(function() {
          duplicate.removeClass('duplicate');
        }, 250)
        return false
      }

      // Allow changing token data before creating it
      var beforeCreateEvent = $.Event('beforeCreateToken')
      beforeCreateEvent.token = {
        value: value,
        label: label
      }
      this.$element.trigger( beforeCreateEvent )

      if (!beforeCreateEvent.token) return

      value = beforeCreateEvent.token.value
      label = beforeCreateEvent.token.label

      var token = $('<div class="token" />')
            .attr('data-value', value)
            .append('<span class="token-label" />')
            .append('<a href="#" class="close" tabindex="-1">&times;</a>')

      // Insert token into HTML
      if (this.$input.hasClass('tt-query')) {
        this.$input.parent().before( token )
      } else {
        this.$input.before( token )
      }
      this.$input.css('width', this.options.minWidth + 'px')

      var tokenLabel = token.find('.token-label')
        , closeButton = token.find('.close')

      // Determine maximum possible token label width
      if (!this.maxTokenWidth) {
        this.maxTokenWidth =
          this.$wrapper.width() - closeButton.outerWidth() - 
          parseInt(closeButton.css('margin-left'), 10) -
          parseInt(closeButton.css('margin-right'), 10) -
          parseInt(token.css('border-left-width'), 10) -
          parseInt(token.css('border-right-width'), 10) -
          parseInt(token.css('padding-left'), 10) -
          parseInt(token.css('padding-right'), 10)
          parseInt(tokenLabel.css('border-left-width'), 10) -
          parseInt(tokenLabel.css('border-right-width'), 10) -
          parseInt(tokenLabel.css('padding-left'), 10) -
          parseInt(tokenLabel.css('padding-right'), 10)
          parseInt(tokenLabel.css('margin-left'), 10) -
          parseInt(tokenLabel.css('margin-right'), 10)
      }

      tokenLabel
        .text(label)
        .css('max-width', this.maxTokenWidth)

      // Listen to events
      token
        .on('mousedown',  function (e) {
          if (_self.disabled) return false;
          _self.preventDeactivation = true
        })
        .on('click',    function (e) {
          if (_self.disabled) return false;
          _self.preventDeactivation = false

          if (e.ctrlKey || e.metaKey) {
            e.preventDefault()
            return _self.toggle( token )
          }
          
          _self.activate( token, e.shiftKey, e.shiftKey )          
        })
        .on('dblclick', function (e) {
          if (_self.disabled) return false;
          _self.edit( token )
        })

      closeButton
          .on('click',  $.proxy(this.remove, this))

      var afterCreateEvent = $.Event('afterCreateToken')
      afterCreateEvent.token = beforeCreateEvent.token
      afterCreateEvent.relatedTarget = token.get(0)
      this.$element.trigger( afterCreateEvent )

      var changeEvent = $.Event('change')
      changeEvent.initiator = 'tokenfield'
      if (triggerChange) {
        this.$element.val( this.getTokensList() ).trigger( changeEvent )
      }
      this.update()

      return this.$input.get(0)
    }    

  , setTokens: function (tokens, add, triggerChange) {
      if (!tokens) return

      if (!add) this.$wrapper.find('.token').remove()

      if (typeof triggerChange === 'undefined') {
          triggerChange = true
      }

      if (typeof tokens === 'string') {
        if (this._delimiters.length) {
          tokens = tokens.split( new RegExp( '[' + this._delimiters.join('') + ']' ) )
        } else {
          tokens = [tokens];
        }
      }

      var _self = this
      $.each(tokens, function (i, token) {
        _self.createToken(token, triggerChange)
      })

      return this.$element.get(0)
    }

  , getTokenData: function(token) {
      var data = token.map(function() {
        var $token = $(this);
        return {
          value: $token.attr('data-value') || $token.find('.token-label').text(),
          label: $token.find('.token-label').text()
        }
      }).get();

      if (data.length == 1) {
        data = data[0];
      }

      return data;
    }

  , getTokens: function(active) {
      var self = this
        , tokens = []
        , activeClass = active ? '.active' : '' // get active tokens only
      this.$wrapper.find( '.token' + activeClass ).each( function() {
        tokens.push( self.getTokenData( $(this) ) )
      })
      return tokens
  }

  , getTokensList: function(delimiter, beautify, active) {
      delimiter = delimiter || this._delimiters[0]
      beautify = ( typeof beautify !== 'undefined' && beautify !== null ) ? beautify : this.options.beautify
      
      var separator = delimiter + ( beautify && delimiter !== ' ' ? ' ' : '')
      return $.map( this.getTokens(active), function (token) {
        return token.value
      }).join(separator)
  }

  , getInput: function() {
    return this.$input.val()
  }

  , listen: function () {
      var _self = this

      this.$element
        .on('change',   $.proxy(this.change, this))

      this.$wrapper
        .on('mousedown',$.proxy(this.focusInput, this))

      this.$input
        .on('focus',    $.proxy(this.focus, this))
        .on('blur',     $.proxy(this.blur, this))
        .on('paste',    $.proxy(this.paste, this))
        .on('keydown',  $.proxy(this.keydown, this))
        .on('keypress', $.proxy(this.keypress, this))
        .on('keyup',    $.proxy(this.keyup, this))

      this.$copyHelper
        .on('focus',    $.proxy(this.focus, this))
        .on('blur',     $.proxy(this.blur, this))        
        .on('keydown',  $.proxy(this.keydown, this))
        .on('keyup',    $.proxy(this.keyup, this))

      // Secondary listeners for input width calculation
      this.$input
        .on('keypress', $.proxy(this.update, this))
        .on('keyup',    $.proxy(this.update, this))

      this.$input
        .on('autocompletecreate', function() {
          // Set minimum autocomplete menu width
          var $_menuElement = $(this).data('ui-autocomplete').menu.element
          
          var minWidth = _self.$wrapper.outerWidth() -
              parseInt( $_menuElement.css('border-left-width'), 10 ) -
              parseInt( $_menuElement.css('border-right-width'), 10 )

          $_menuElement.css( 'min-width', minWidth + 'px' )
        })
        .on('autocompleteselect', function (e, ui) {
          if (_self.createToken( ui.item )) {
            _self.$input.val('')
            if (_self.$input.data( 'edit' )) {
              _self.unedit(true)
            }
          }
          return false
        })
        .on('typeahead:selected', function (e, datum, dataset) {
          var valueKey = 'value'

          // Get the actual valueKey for this dataset
          $.each(_self.$input.data('ttView').datasets, function (i, set) {
            if (set.name === dataset) {
              valueKey = set.valueKey
            }
          })

          // Create token
          if (_self.createToken( datum[valueKey] )) {
            _self.$input.typeahead('setQuery', '')
            if (_self.$input.data( 'edit' )) {
              _self.unedit(true)
            }
          }
        })
        .on('typeahead:autocompleted', function (e, datum, dataset) {
          _self.createToken( _self.$input.val() )
          _self.$input.typeahead('setQuery', '')
          if (_self.$input.data( 'edit' )) {
            _self.unedit(true)
          }
        })

      // Listen to window resize
      $(window).on('resize', $.proxy(this.update, this ))

    }

  , keydown: function (e) {

      if (!this.focused) return        

      switch(e.keyCode) {
        case 8: // backspace
          if (!this.$input.is(document.activeElement)) break
          this.lastInputValue = this.$input.val()
          break

        case 37: // left arrow
          if (this.$input.is(document.activeElement)) {
            if (this.$input.val().length > 0) break

            var prev = this.$input.hasClass('tt-query') ? this.$input.parent().prevAll('.token:first') : this.$input.prevAll('.token:first')

            if (!prev.length) break

            this.preventInputFocus = true
            this.preventDeactivation = true

            this.activate( prev )
            e.preventDefault()

          } else {

            this.prev( e.shiftKey )
            e.preventDefault()
          }
          break

        case 38: // up arrow
          if (!e.shiftKey) return

          if (this.$input.is(document.activeElement)) {
            if (this.$input.val().length > 0) break

            var prev = this.$input.hasClass('tt-query') ? this.$input.parent().prevAll('.token:last') : this.$input.prevAll('.token:last')
            if (!prev.length) return

            this.activate( prev )
          }

          var _self = this
          this.firstActiveToken.nextAll('.token').each(function() {
            _self.deactivate( $(this) )
          })

          this.activate( this.$wrapper.find('.token:first'), true, true )
          e.preventDefault()
          break

        case 39: // right arrow
          if (this.$input.is(document.activeElement)) {

            if (this.$input.val().length > 0) break
            
            var next = this.$input.hasClass('tt-query') ? this.$input.parent().nextAll('.token:first') : this.$input.nextAll('.token:first')

            if (!next.length) break

            this.preventInputFocus = true
            this.preventDeactivation = true

            this.activate( next )
            e.preventDefault()              

          } else {
            this.next( e.shiftKey )
            e.preventDefault()
          }
          break

        case 40: // down arrow
          if (!e.shiftKey) return

          if (this.$input.is(document.activeElement)) {
            if (this.$input.val().length > 0) break

            var next = this.$input.hasClass('tt-query') ? this.$input.parent().nextAll('.token:first') : this.$input.nextAll('.token:first')
            if (!next.length) return

            this.activate( next )
          }

          var _self = this
          this.firstActiveToken.prevAll('.token').each(function() {
            _self.deactivate( $(this) )
          })          

          this.activate( this.$wrapper.find('.token:last'), true, true )
          e.preventDefault()
          break        

        case 65: // a (to handle ctrl + a)
          if (this.$input.val().length > 0 || !(e.ctrlKey || e.metaKey)) break
          this.activateAll()
          e.preventDefault()
          break

        case 9: // tab
        case 13: // enter     

          // We will handle creating tokens from autocomplete in autocomplete events
          if (this.$input.data('ui-autocomplete') && this.$input.data('ui-autocomplete').menu.element.find("li:has(a.ui-state-focus)").length) break
          
          // We will handle creating tokens from typeahead in typeahead events
          if (this.$input.hasClass('tt-query') && this.$wrapper.find('.tt-is-under-cursor').length ) break
          if (this.$input.hasClass('tt-query') && this.$wrapper.find('.tt-hint').val().length) break
          
          // Create token
          if (this.$input.is(document.activeElement) && this.$input.val().length || this.$input.data('edit')) {
            return this.createTokensFromInput(e, this.$input.data('edit'));
          }

          // Edit token
          if (e.keyCode === 13) {
            if (!this.$copyHelper.is(document.activeElement) || this.$wrapper.find('.token.active').length !== 1) break
            this.edit( this.$wrapper.find('.token.active') )
          }
      }

      this.lastKeyDown = e.keyCode
    }

  , keypress: function(e) {
      this.lastKeyPressCode = e.keyCode
      this.lastKeyPressCharCode = e.charCode

      // Comma
      if ($.inArray( e.charCode, this._triggerKeys) !== -1 && this.$input.is(document.activeElement)) {
        if (this.$input.val()) {
          this.createTokensFromInput(e)
        }
        return false;
      }
    }

  , keyup: function (e) {
      this.preventInputFocus = false

      if (!this.focused) return

      switch(e.keyCode) {
        case 8: // backspace
          if (this.$input.is(document.activeElement)) {
            if (this.$input.val().length || this.lastInputValue.length && this.lastKeyDown === 8) break
            
            this.preventDeactivation = true
            var prev = this.$input.hasClass('tt-query') ? this.$input.parent().prevAll('.token:first') : this.$input.prevAll('.token:first')

            if (!prev.length) break

            this.activate( prev )
          } else {
            this.remove(e)
          }
          break

        case 46: // delete
          this.remove(e, 'next')
          break
      }
      this.lastKeyUp = e.keyCode
    }

  , focus: function (e) {
      this.focused = true
      this.$wrapper.addClass('focus')

      if (this.$input.is(document.activeElement)) {
        this.$wrapper.find('.active').removeClass('active')
        this.firstActiveToken = null

        if (this.options.showAutocompleteOnFocus) {
          this.search()
        }
      }
    }

  , blur: function (e) {

      this.focused = false
      this.$wrapper.removeClass('focus')

      if (!this.preventDeactivation && !this.$element.is(document.activeElement)) {
        this.$wrapper.find('.active').removeClass('active')
        this.firstActiveToken = null
      }

      if (!this.preventCreateTokens && (this.$input.data('edit') && !this.$input.is(document.activeElement) || this.options.createTokensOnBlur )) {
        this.createTokensFromInput(e) 
      }
      
      this.preventDeactivation = false
      this.preventCreateTokens = false
    }

  , paste: function (e) {
      var _self = this
      
      // Add tokens to existing ones
      setTimeout(function () {
        _self.createTokensFromInput(e)
      }, 1)
    }

  , change: function (e) {
      if ( e.initiator === 'tokenfield' ) return // Prevent loops
      
      this.setTokens( this.$element.val() )
    }

  , createTokensFromInput: function (e, focus) {
      if (this.$input.val().length < this.options.minLength)
        return // No input, simply return

      var tokensBefore = this.getTokensList()
      this.setTokens( this.$input.val(), true )
      
      if (tokensBefore == this.getTokensList() && this.$input.val().length)
        return false // No tokens were added, do nothing (prevent form submit)

      if (this.$input.hasClass('tt-query')) {
        // Typeahead acts weird when simply setting input value to empty,
        // so we set the query to empty instead
        this.$input.typeahead('setQuery', '')
      } else {
        this.$input.val('')
      }

      if (this.$input.data( 'edit' )) {
        this.unedit(focus)
      }

      return false // Prevent form being submitted
    }  

  , next: function (add) {
      if (add) {
        var firstActive = this.$wrapper.find('.active:first')
          , deactivate = firstActive && this.firstActiveToken ? firstActive.index() < this.firstActiveToken.index() : false

        if (deactivate) return this.deactivate( firstActive )
      }

      var active = this.$wrapper.find('.active:last')
        , next = active.nextAll('.token:first')

      if (!next.length) {
        this.$input.focus()
        return
      }

      this.activate(next, add)
    }

  , prev: function (add) {

      if (add) {
        var lastActive = this.$wrapper.find('.active:last')
          , deactivate = lastActive && this.firstActiveToken ? lastActive.index() > this.firstActiveToken.index() : false

        if (deactivate) return this.deactivate( lastActive )
      }

      var active = this.$wrapper.find('.active:first')
        , prev = active.prevAll('.token:first')

      if (!prev.length) {
        prev = this.$wrapper.find('.token:first')
      }

      if (!prev.length && !add) {
        this.$input.focus()
        return
      }

      this.activate( prev, add )
    }

  , activate: function (token, add, multi, remember) {

      if (!token) return

      if (this.$wrapper.find('.token.active').length === this.$wrapper.find('.token').length) return

      if (typeof remember === 'undefined') var remember = true

      if (multi) var add = true

      this.$copyHelper.focus()

      if (!add) {
        this.$wrapper.find('.active').removeClass('active')
        if (remember) {
          this.firstActiveToken = token 
        } else {
          delete this.firstActiveToken
        }
      }

      if (multi && this.firstActiveToken) {
        // Determine first active token and the current tokens indicies
        // Account for the 1 hidden textarea by subtracting 1 from both
        var i = this.firstActiveToken.index() - 2
          , a = token.index() - 2
          , _self = this

        this.$wrapper.find('.token').slice( Math.min(i, a) + 1, Math.max(i, a) ).each( function() {
          _self.activate( $(this), true )
        })
      }

      token.addClass('active')
      this.$copyHelper.val( this.getTokensList( null, null, true ) ).select()
    }

  , activateAll: function() {
      var _self = this

      this.$wrapper.find('.token').each( function (i) {
        _self.activate($(this), i !== 0, false, false)
      })
    }

  , deactivate: function(token) {
      if (!token) return

      token.removeClass('active')
      this.$copyHelper.val( this.getTokensList( null, null, true ) ).select()
    }

  , toggle: function(token) {
      if (!token) return

      token.toggleClass('active')
      this.$copyHelper.val( this.getTokensList( null, null, true ) ).select()
    }

  , edit: function (token) {
      if (!token) return

      var value = token.data('value')
        , label = token.find('.token-label').text()

      // Allow changing input value before editing
      var beforeEditEvent = $.Event('beforeEditToken')
      beforeEditEvent.token = {
        value: value,
        label: label
      }
      beforeEditEvent.relatedTarget = token.get(0)
      this.$element.trigger( beforeEditEvent )
      
      if (!beforeEditEvent.token) return

      value = beforeEditEvent.token.value
      label = beforeEditEvent.token.label

      token.find('.token-label').text(value)
      var tokenWidth = token.outerWidth()

      var $_input = this.$input.hasClass('tt-query') ? this.$input.parent() : this.$input

      token.replaceWith( $_input )

      this.preventCreateTokens = true

      this.$input.val( value )
                .select()
                .data( 'edit', true )
                .width( tokenWidth )
    }

  , unedit: function (focus) {
      var $_input = this.$input.hasClass('tt-query') ? this.$input.parent() : this.$input
      $_input.appendTo( this.$wrapper )
      
      this.$input.data('edit', false)

      this.update()

      // Because moving the input element around in DOM 
      // will cause it to lose focus, we provide an option
      // to re-focus the input after appending it to the wrapper
      if (focus) {
        var _self = this
        setTimeout(function () {
          _self.$input.focus()
        }, 1)
      }
    }

  , remove: function (e, direction) {
      if (this.$input.is(document.activeElement) || this.disabled) return

      var token = (e.type === 'click') ? $(e.target).closest('.token') : this.$wrapper.find('.token.active')
      
      if (e.type !== 'click') {
        if (!direction) var direction = 'prev'
        this[direction]()

        // Was this the first token?
        if (direction === 'prev') var firstToken = token.first().prevAll('.token:first').length === 0
      }

      // Prepare events

      var removeEvent = $.Event('removeToken')
      removeEvent.token = this.getTokenData( token )

      var changeEvent = $.Event('change')
      changeEvent.initiator = 'tokenfield'

      // Remove token from DOM
      token.remove()

      // Trigger events
      this.$element.val( this.getTokensList() ).trigger( removeEvent ).trigger( changeEvent )

      // Focus, when necessary:
      // When there are no more tokens, or if this was the first token
      // and it was removed with backspace or it was clicked on
      if (!this.$wrapper.find('.token').length || e.type === 'click' || firstToken) this.$input.focus()

      // Adjust input width
      this.$input.css('width', this.options.minWidth + 'px')
      this.update()

      e.preventDefault()
      e.stopPropagation()
    }

  , update: function (e) {
      var value = this.$input.val()

      if (this.$input.data('edit')) {

        if (!value) {
          value = this.$input.prop("placeholder")
        }
        if (value === this.$mirror.text()) return

        this.$mirror.text(value)
        
        var mirrorWidth = this.$mirror.width() + 10;
        if ( mirrorWidth > this.$wrapper.width() ) {
          return this.$input.width( this.$wrapper.width() )
        }

        this.$input.width( mirrorWidth )
      }
      else {
        this.$input.css( 'width', this.options.minWidth + 'px' )
        this.$input.width( this.$wrapper.offset().left + this.$wrapper.width() - this.$input.offset().left + 5 )
      }
    }

  , focusInput: function (e) {
      if ($(e.target).closest('.token').length || $(e.target).closest('.token-input').length) return
      // Focus only after the current call stack has cleared,
      // otherwise has no effect.
      // Reason: mousedown is too early - input will lose focus
      // after mousedown. However, since the input may be moved
      // in DOM, there may be no click or mouseup event triggered.
      var _self = this
      setTimeout(function() {
        _self.$input.focus()
      }, 0)
    }

  , search: function () {
      if ( this.$input.data('ui-autocomplete') ) {
        this.$input.autocomplete('search')
      }
    }

  , disable: function () {
      this.disabled = true;
      this.$input.prop('disabled', true);
      this.$element.prop('disabled', true);
      this.$wrapper.addClass('disabled');
    }

  , enable: function () {
      this.disabled = false;
      this.$input.prop('disabled', false);
      this.$element.prop('disabled', false);
      this.$wrapper.removeClass('disabled');
    }

  }


 /* TOKENFIELD PLUGIN DEFINITION
  * ======================== */

  var old = $.fn.tokenfield

  $.fn.tokenfield = function (option, param) {
    var value
      , args = []
    
    Array.prototype.push.apply( args, arguments );

    var elements = this.each(function () {
      var $this = $(this)
        , data = $this.data('bs.tokenfield')
        , options = typeof option == 'object' && option

      if (typeof option === 'string' && data && data[option]) {
        args.shift()
        value = data[option].apply(data, args)
      } else {
        if (!data) $this.data('bs.tokenfield', (data = new Tokenfield(this, options)))
      }
    })

    return typeof value !== 'undefined' ? value : elements;
  }

  $.fn.tokenfield.defaults = {
    minWidth: 60,
    minLength: 0,
    allowDuplicates: false,
    autocomplete: {},
    typeahead: {},
    showAutocompleteOnFocus: false,
    createTokensOnBlur: false,
    delimiter: ',',
    beautify: true
  }

  $.fn.tokenfield.Constructor = Tokenfield


 /* TOKENFIELD NO CONFLICT
  * ================== */

  $.fn.tokenfield.noConflict = function () {
    $.fn.tokenfield = old
    return this
  }

  return Tokenfield;

}));
