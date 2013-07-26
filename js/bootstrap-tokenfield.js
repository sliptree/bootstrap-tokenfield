/* ============================================================
 * bootstrap-tokenfield.js v0.5
 * ============================================================
 * Copyright 2013 Sliptree
 * ============================================================ */


!function ($) {

  "use strict"; // jshint ;_;


 /* TOKENFIELD PUBLIC CLASS DEFINITION
  * ============================== */

  var TokenField = function (element, options) {
    var _self = this

    this.$input = $(element)
    this.$element = $('<div class="tokenfield" />')
    this.$helper = $('<textarea tabindex="-1" style="position: absolute; left: -10000px; top: -10000px" />').appendTo(this.$element)

    this.$element.insertBefore( this.$input )
    this.$input.appendTo( this.$element )

    this.options = $.extend({}, $.fn.tokenField.defaults, { tokens: this.$input.data('tokens') }, options)
    
    if (typeof this.options.tokens === 'string') {
      this.options.tokens = this.options.tokens.split(',')
    }

    if (this.options.tokens) {
      $.each(this.options.tokens, function (i, token) {
        _self.createToken(token)
      })
    }

    this.listen()
  }

  TokenField.prototype = {

    constructor: TokenField

  , next: function () {
      var active = this.$element.find('.active').removeClass('active')
        , next = active.next('.token')

      if (next.length) {
        next.addClass('active')
      }
      else {
        this.$input.focus()
      }

    }

  , prev: function (tryFirst) {
      if (typeof tryFirst === 'undefined') var tryFirst = true

      var active = this.$element.find('.active').removeClass('active')
        , prev = active.prev('.token')

      if (!prev.length) {
        prev = this.$element.find('.token:first')
      }

      prev.addClass('active')

      if (!prev.length) {
        this.$input.focus()
      }
      
    }

  , activate: function (token) {
      this.$helper.focus()
      this.$element.find('.active').removeClass('active')
      token.addClass('active')
    }

  , activateAll: function() {
      this.focused = true
      this.$element.addClass('focus')
      this.$element.find('.token').addClass('active')
      this.$helper.val(this.getTokensList()).select()
    }

  , getTokens: function() {
      var tokens = []
      this.$element.find('.token').each( function() {
        tokens.push({
          value: $(this).data('value') || $(this).find('.token-label').html(),
          label: $(this).find('.token-label').html()
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

      this.$helper
        .on('focus',    $.proxy(this.focus, this))
        .on('blur',     $.proxy(this.blur, this))        

      $(document)
        .on('click',    $.proxy(this.handleDocumentClick, this))
        .on('keydown',  $.proxy(this.keydown, this))
        .on('keyup',    $.proxy(this.keyup, this))
    }

  , paste: function () {
      var tokenField = this
        , input = this.$element.find('input')
      setTimeout(function () {
        var text = input.val()
          , tokens = text.split(',')
        
        $.each(tokens, function (i, token) {
          tokenField.createToken( token )
        })
        input.val('')
      }, 1)
    }

  , move: function (e) {
      if (!this.focused) return
      var input = this.$element.find('input')

      switch(e.keyCode) {
        case 9: // tab
        case 13: // enter
        case 27: // escape
          break

        case 37: // left arrow
          if (input.is(':focus') && input.val().length > 0) return
          e.preventDefault()
          if (input.is(':focus')) {
            this.handleInputBackspace()
          } else {
            this.prev()
          }
          break

        case 39: // right arrow
          if (input.is(':focus')) return
          e.preventDefault()
          this.next()
          break
      }

      e.stopPropagation()
    }

  , createTokenFromInput: function (e) {
      if (!this.focused || !this.$input.is(':focus') || !this.$input.val()) return
      this.createToken(this.$input.val()) 
      this.$input.val('').focus()
      e.preventDefault()
      e.stopPropagation()
    }

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

  , handleInputBackspace: function () {
      var input = this.$element.find('input');
      this.surpressRemove = false

      if (!input.is(':focus') || input.val().length > 0 || !this.$element.find('.token').length) return
      
      input.blur()
      this.activate(this.$element.find('.token:last'))
      this.surpressRemove = true
    }

  , remove: function (e, direction) {
      if (this.$input.is(':focus') || this.surpressRemove) return

      var token = (e.type === 'click') ? $(e.target).closest('.token') : this.$element.find('.token.active')
      if (!direction) direction = 'prev'

      this[direction]()
      token.remove()

      if (!this.$element.find('.token').length || e.type === 'click') this.$input.focus()
    }

  , keydown: function (e) {
      if (~$.inArray(e.keyCode, [37,39])) this.move(e)
      if (~$.inArray(e.keyCode, [9,13,188])) this.createTokenFromInput(e)
      
      switch(e.keyCode) {
        case 65: // a
          if (!this.focused || this.$element.find('input').is(':focus') || !(e.ctrlKey || e.metaKey)) return
          this.activateAll()
          e.preventDefault()
          break

        // case 86: // v
        //   if (!this.$element.find('input').is(':focus') || !(e.ctrlKey || e.metaKey)) return

        //   e.preventDefault()
        //   break
      }
    }

  , keyup: function (e) {
      if (!this.focused) return
      switch(e.keyCode) {
        case 8: // backspace
          this.handleInputBackspace()
          this.remove(e)
          break

        case 46: // delete
          this.surpressRemove = false
          this.remove(e, 'next')
          break

        case 9: // tab
        case 13: // enter
        case 188: // comma
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
        this.surpressRemove = false
        this.remove(e)
        return false;
      }
      // Click was on a token
      if ($(e.target).closest(this.$element.find('.token')).length) {
        this.surpressRemove = false
        this.activate($(e.target).closest(this.$element.find('.token')))
        return false;
      }
      // Click was outside of tokenField
      if ($(e.target).closest(this.$element).length === 0) {
        this.surpressRemove = false
        this.blur()
      } 
    }

  }

  // TokenField.prototype.setState = function (state) {
  //   var d = 'disabled'
  //     , $el = this.$element
  //     , data = $el.data()
  //     , val = $el.is('input') ? 'val' : 'html'

  //   state = state + 'Text'
  //   data.resetText || $el.data('resetText', $el[val]())

  //   $el[val](data[state] || this.options[state])

  //   // push to event loop to allow forms to submit
  //   setTimeout(function () {
  //     state == 'loadingText' ?
  //       $el.addClass(d).attr(d, d) :
  //       $el.removeClass(d).removeAttr(d)
  //   }, 0)
  // }

  // Button.prototype.toggle = function () {
  //   var $parent = this.$element.closest('[data-toggle="buttons-radio"]')

  //   $parent && $parent
  //     .find('.active')
  //     .removeClass('active')

  //   this.$element.toggleClass('active')
  // }


 /* TAGINPUT PLUGIN DEFINITION
  * ======================== */

  var old = $.fn.tokenField

  $.fn.tokenField = function (option) {
    return this.each(function () {
      var $this = $(this)
        , data = $this.data('tokenField')
        , options = typeof option == 'object' && option
      if (!data) $this.data('tokenField', (data = new TokenField(this, options)))
    })
  }

  // $.fn.button.defaults = {
  //   tokens: this.$input.tokens
  // }

  $.fn.tokenField.Constructor = TokenField


 /* TAGINPUT NO CONFLICT
  * ================== */

  $.fn.tokenField.noConflict = function () {
    $.fn.tokenField = old
    return this
  }

}(window.jQuery);