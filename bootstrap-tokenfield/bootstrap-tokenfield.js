/* ============================================================
 * bootstrap-tokenfield.js v0.5
 * ============================================================
 *
 * Copyright 2013 Sliptree
 * ============================================================ */


!function ($) {

  "use strict"; // jshint ;_;


 /* TOKENFIELD PUBLIC CLASS DEFINITION
  * ============================== */

  var Tokenfield = function (element, options) {
    var _self = this

    this.$input = $(element).addClass('token-input')
    this.$element = $('<div class="tokenfield" />')
    this.$helper = $('<textarea class="token-helper" tabindex="-1" style="position: absolute; left: -10000px;" />').appendTo(this.$element)
    this.$mirror = $('<span style="position:absolute; top:-999px; left:0; white-space:pre;"/>');

    this.options = $.extend({}, $.fn.tokenfield.defaults, { tokens: this.$input.data('tokens') }, options)
    
    // Copy some styles
    this.$element.width( this.$input.width() )

    // Set up mirror for input auto-sizing
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
    this.$element.insertBefore( this.$input )
    this.$input.appendTo( this.$element )
    
    this.setTokens(this.options.tokens)

    this.update()

    this.listen()
  }

  Tokenfield.prototype = {

    constructor: Tokenfield

  , createToken: function (attrs) {
      if (typeof attrs === 'string') {
        attrs = { value: attrs, label: attrs }
      }
      
      var _self = this
        , value = $.trim(attrs.value)
        , label = attrs.label.length ? $.trim(attrs.label) : value

      if (!value.length || !label.length || value.length < this.options.minLength) return

      var token = $('<div class="token" />')
            .attr('data-value', value)
            .append('<span class="token-label" />')
            .append('<a href="#" class="close" tabindex="-1">&times;</a>')
        
      this.$input.before( token )

      var tokenLabel = token.find('.token-label')
        , closeButton = token.find('.close')

      // Determine maximum possible token label width
      if (!this.maxTokenWidth) {
        this.maxTokenWidth =
          this.$element.width() - closeButton.outerWidth() - 
          parseInt(closeButton.css('margin-left')) -
          parseInt(closeButton.css('margin-right')) -
          parseInt(token.css('border-left-width')) -
          parseInt(token.css('border-right-width')) -
          parseInt(token.css('padding-left')) -
          parseInt(token.css('padding-right'))
          parseInt(tokenLabel.css('border-left-width')) -
          parseInt(tokenLabel.css('border-right-width')) -
          parseInt(tokenLabel.css('padding-left')) -
          parseInt(tokenLabel.css('padding-right'))
          parseInt(tokenLabel.css('margin-left')) -
          parseInt(tokenLabel.css('margin-right'))
      }

      tokenLabel
        .text(label)
        .css('max-width', this.maxTokenWidth)

      // Listen to events
      token
        .on('click',    function (e) {
          _self.activate( token )
        })
        .on('dblclick', function (e) {
          _self.edit( token )
        })

      closeButton
          .on('click',  $.proxy(this.remove, this))
    }    

  , setTokens: function (tokens, add) {
      if (!tokens) return

      if (!add) this.$element.find('.token').remove()

      if (typeof tokens === 'string') {
        tokens = tokens.split(',')
      }

      var _self = this
      $.each(tokens, function (i, token) {
        _self.createToken(token)
      })
    }

  , getTokens: function() {
      var tokens = []
      this.$element.find('.token').each( function() {
        tokens.push({
          value: $(this).data('value') || $(this).find('.token-label').text(),
          label: $(this).find('.token-label').text()
        })
      })
      return tokens
  }

  , getTokensList: function() {
      return $.map( this.getTokens(), function (token) {
        return token.value
      }).join(', ')
  }

  , listen: function () {
      this.$input
        .on('focus',    $.proxy(this.focus, this))
        .on('blur',     $.proxy(this.blur, this))
        .on('paste',    $.proxy(this.paste, this))
        .on('keydown',  $.proxy(this.keydown, this))
        .on('keyup',    $.proxy(this.keyup, this))

      this.$helper
        .on('focus',    $.proxy(this.focus, this))
        .on('blur',     $.proxy(this.blur, this))        
        .on('keydown',  $.proxy(this.keydown, this))
        .on('keyup',    $.proxy(this.keyup, this))

      // Secondary listeners for input width calculation
      this.$input.on('keydown, keypress, keyup',  $.proxy(this.update, this))
    }

  , keydown: function (e) {

      if (!this.focused) return

      this.lastKeyDown = e.keyCode

      switch(e.keyCode) {
        case 8: // backspace
          if (!this.$input.is(':focus')) return
          this.lastInputValue = this.$input.val()
          break

        case 37: // left arrow
          if (this.$input.is(':focus')) {
            if (this.$input.val().length > 0) return
            this.activate( this.$input.prev('.token') )
            e.preventDefault()
          } else {
            this.prev()
            e.preventDefault()
          }
          break

        case 39: // right arrow
          if (this.$input.is(':focus')) return
          this.next()
          e.preventDefault()
          break

        case 65: // a (to handle ctrl + a)
          if (this.$input.val().length > 0 || !(e.ctrlKey || e.metaKey)) return
          this.activateAll()
          e.preventDefault()
          break

        case 9: // tab
        case 13: // enter
        case 188: // comma
          if (this.$input.is(':focus') && this.$input.val()) {
            this.createTokensFromInput(e)
          }
          if (e.keyCode === 13) {
            if (!this.$helper.is(':focus') || this.$element.find('.token.active').length !== 1) return
            this.edit( this.$element.find('.token.active') )
          }
      }
    }

  , keyup: function (e) {
      if (!this.focused) return
      switch(e.keyCode) {
        case 8: // backspace
          if (this.$input.is(':focus')) {
            if (this.$input.val().length || this.lastInputValue.length && this.lastKeyDown === 8) return
            this.activate( this.$input.prev('.token') )
          } else {
            this.remove(e)
          }
          break

        case 46: // delete
          this.remove(e, 'next')
          break
      }
    }

  , focus: function (e) {
      this.focused = true
      this.$element.addClass('focus')
      this.$element.find('.active').removeClass('active')
    }

  , blur: function (e) {
      this.focused = false
      this.$element.removeClass('focus')
      this.$element.find('.active').removeClass('active')

      if (this.$input.data('edit')) {
        this.createTokensFromInput(e)
      }
    }

  , paste: function (e) {
      var _self = this
      
      // Add tokens to existing ones
      setTimeout(function () {
        _self.createTokensFromInput(e)
      }, 1)
    }

  , createTokensFromInput: function (e) {
      this.setTokens( this.$input.val(), true )
      this.$input.val('')

      if (this.$input.data( 'edit' )) {
        this.$input
          .appendTo( this.$element )
          .data( 'edit', false )
          .css( 'width', 'auto' )
          .focus()

        this.$element.css( 'width', this.$element.data('prev-width') )
      }

      this.$input.css('width', this.options.minWidth + 'px')

      e.preventDefault()
      e.stopPropagation()
    }  

  , next: function () {
      var active = this.$element.find('.active:last')
        , next = active.next('.token')

      if (!next.length) {
        this.$input.focus()
        return
      }

      this.activate(next)
    }

  , prev: function () {
      var active = this.$element.find('.active:first')
        , prev = active.prev('.token')

      if (!prev.length) {
        prev = this.$element.find('.token:first')
      }

      if (!prev.length) {
        this.$input.focus()
        return
      }

      this.activate( prev )
    }

  , activate: function (token) {
      if (!token) return

      this.$helper.focus()

      this.$element.find('.active').removeClass('active')
      token.addClass('active')
      this.$helper.val( token.data('value') ).select()
    }

  , activateAll: function() {
      this.$helper.focus()

      this.$element.find('.token').addClass('active')
      this.$helper.val( this.getTokensList() ).select()
    }

  , edit: function (token) {
      if (!token) return

      var value = token.data('value')
        , label = token.find('.token-label').text()
        , tokenWidth = token.outerWidth()

      this.$element
        .data( 'prev-width', this.$element.get(0).style.width )
        .width( this.$element.width() )

      token.replaceWith( this.$input )
      this.$input.focus()
                .val( value )
                .select()
                .data( 'edit', true )
                .width( tokenWidth )
    }

  , remove: function (e, direction) {
      if (this.$input.is(':focus')) return

      var token = (e.type === 'click') ? $(e.target).closest('.token') : this.$element.find('.token.active')
      if (!direction) direction = 'prev'

      this[direction]()
      token.remove()

      if (!this.$element.find('.token').length || e.type === 'click') this.$input.focus()

      this.$input.css('width', this.options.minWidth + 'px')
      this.update()

      e.preventDefault()
      e.stopPropagation()
    }

  , update: function () {
      var value = this.$input.val()

      if (this.$input.data('edit')) {
        if (!value) {
          value = this.$input.prop("placeholder")
        }
        if (value === this.$mirror.text()) return

        this.$mirror.text(value)

        this.$input.width(this.$mirror.width() + 10)
      }
      else {
        this.$input.width( this.$element.offset().left + this.$element.width() - this.$input.offset().left )
      }
    }

  }


 /* TOKENFIELD PLUGIN DEFINITION
  * ======================== */

  var old = $.fn.tokenfield

  $.fn.tokenfield = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('tokenfield')
        , options = typeof option == 'object' && option
      if (!data) $this.data('tokenfield', (data = new Tokenfield(this, options)))
    })
  }

  $.fn.tokenfield.defaults = {
    minWidth: 60,
    minLength: 0
  }  

  $.fn.tokenfield.Constructor = Tokenfield


 /* TOKENFIELD NO CONFLICT
  * ================== */

  $.fn.tokenfield.noConflict = function () {
    $.fn.tokenfield = old
    return this
  }

}(window.jQuery);