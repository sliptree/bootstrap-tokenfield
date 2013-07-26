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

    this.$input = $(element)
    this.$element = $('<div class="tokenfield" />')
    this.$helper = $('<textarea tabindex="-1" style="position: absolute; left: -10000px; top: -10000px" />').appendTo(this.$element)

    this.$element.insertBefore( this.$input )
    this.$input.appendTo( this.$element )

    this.options = $.extend({}, $.fn.tokenfield.defaults, { tokens: this.$input.data('tokens') }, options)
    
    this.setTokens(this.options.tokens)

    this.listen()
  }

  Tokenfield.prototype = {

    constructor: Tokenfield

  , createToken: function (attrs) {
      if (typeof attrs === 'string') {
        attrs = { value: attrs, label: attrs }
      }

      var value = $.trim(attrs.value)
        , label = attrs.label.length ? $.trim(attrs.label) : value

      if (!value.length || !label.length) return

      var token = $('<div class="token" />')
            .attr('data-value', value)
            .append('<span class="token-label" />')
            .append('<a href="#" class="close" tabindex="-1">&times;</a>')

      token.find('.token-label').text(label)
      this.$input.before( token )
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

      $(document)
        .on('click',    $.proxy(this.handleDocumentClick, this))
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
            this.last()
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
          if (!this.$helper.is(':focus') || !(e.ctrlKey || e.metaKey)) return
          this.activateAll()
          e.preventDefault()
          break

        case 9: // tab
        case 13: // enter
        case 188: // comma
          this.createTokensFromInput(e)
      }
    }

  , keyup: function (e) {
      if (!this.focused) return
      switch(e.keyCode) {
        case 8: // backspace
          if (this.$input.is(':focus')) {
            if (this.$input.val().length || this.lastInputValue.length && e.lastKeyDown === 8) return
            this.last()
          } else {
            this.remove(e)
          }
          break

        case 46: // delete
          this.remove(e, 'next')
          break
      }

      e.stopPropagation()
      e.preventDefault()
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
    }

  , handleDocumentClick: function (e) {
      // Click was on a close icon
      if ($(e.target).closest(this.$element.find('.close')).length) {
        this.remove(e)
        return false;
      }
      // Click was on a token
      if ($(e.target).closest(this.$element.find('.token')).length) {
        this.activate($(e.target).closest(this.$element.find('.token')))
        return false;
      }
      // Click was outside of tokenfield
      if ($(e.target).closest(this.$element).length === 0) {
        this.blur()
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
      if (!this.focused || !this.$input.is(':focus') || !this.$input.val()) return
      
      this.setTokens( this.$input.val(), true )
      this.$input.val('')

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

  , last: function () {
      this.activate(this.$element.find('.token:last'))
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

  , remove: function (e, direction) {
      if (this.$input.is(':focus')) return

      var token = (e.type === 'click') ? $(e.target).closest('.token') : this.$element.find('.token.active')
      if (!direction) direction = 'prev'

      this[direction]()
      token.remove()

      if (!this.$element.find('.token').length || e.type === 'click') this.$input.focus()
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

  $.fn.tokenfield.Constructor = Tokenfield


 /* TOKENFIELD NO CONFLICT
  * ================== */

  $.fn.tokenfield.noConflict = function () {
    $.fn.tokenfield = old
    return this
  }

}(window.jQuery);