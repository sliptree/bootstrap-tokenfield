// Global tokenfield test object
var TFT = {};

beforeEach(function() {
  var template = TFT.template || '<input type="text" class="tokenize" value="" />';

  this.$sandbox = $('<div />').appendTo($('body'));
  this.$template = $(template).appendTo(this.$sandbox);

  this.$field = this.$template.hasClass('tokenize') ? this.$template : this.$template.find('.tokenize');
  this.$field.tokenfield( this.options );
});

afterEach( function() {
  this.$sandbox.remove();

  delete this.$field;
  delete this.$sandbox;
  delete this.$template;
});

describe('initializing tokenfield', function() {

  describe('with an empty input', function() {

    it('should wrap the original input with the wrapper element', function() {
      this.$field.parents('.tokenfield').hasClass('form-control').should.be.true;
    });

    it('should create a new input element for token input', function() {
      this.$field.parents('.tokenfield').find('.token-input').length.should.equal(1);
    });

    it('should move the original input out of the way', function() {
      this.$field.css('position').should.equal('absolute');
      this.$field.css('left').should.equal('-10000px');
      this.$field.data('bs.tokenfield').$wrapper.offset().left.should.be.above(this.$field.offset().left);
    });

    it('should not create any tokens', function() {
      this.$field.data('bs.tokenfield').$wrapper.find('.token').length.should.equal(0);
    });

  });

  describe('with an input with comma-separated values', function() {

    before(function() {
      TFT.template = '<input type="text" class="tokenize" value="red,green, blue" />';
    });

    after(function() {
      TFT.template = null;
    });

    it('should create tokens for each comma-separated value', function() {
      this.$field.data('bs.tokenfield').$wrapper.find('.token').length.should.equal(3);
    });

  });

});

describe('Tokenfield public methods', function() {

  describe('createToken()', function() {

    describe('using an empty input', function() {

      beforeEach(function() {
        this.$field.tokenfield('createToken', 'awesome');
      });

      it('should create a new token', function() {
        this.$field.data('bs.tokenfield').$wrapper.find('.token').should.have.length(1);
      });

      it('add the new token value to original input', function() {
        this.$field.val().should.equal('awesome');
      });

    });

    describe('using an empty input', function() {

      before(function() {
        TFT.template = '<input type="text" class="tokenize" value="red,green, blue" />';
      });

      beforeEach(function() {
        this.$field.tokenfield('createToken', 'awesome');
      });

      after(function() {
        TFT.template = null;
      });      

      it('should append a new token to the end of existing tokens', function() {
        this.$field.val().should.equal('red, green, blue, awesome');
      });

    });

  });  

  describe('getTokens()', function() {

    before(function() {
      TFT.template = '<input type="text" class="tokenize" value="red,green, blue" />';
    });

    after(function() {
      TFT.template = null;
    });

    it('should return an array of token key-value pairs', function() {
      var tokens = this.$field.tokenfield('getTokens');
      tokens.should.be.an('array');
      tokens.should.have.length(3);
      tokens[0].should.include.keys('label', 'value');
      tokens[0].label.should.equal('red');
      tokens[0].value.should.equal('red');
    });

  });

  describe('getTokensList()', function() {

    before(function() {
      TFT.template = '<input type="text" class="tokenize" value="red,green, blue" />';
    });

    after(function() {
      TFT.template = null;
    });   

    it('should return a string with comma-separated token values', function() {
      var tokens = this.$field.tokenfield('getTokensList');
      tokens.should.be.a('string');
      tokens.should.equal('red, green, blue');
    });

  });

  describe('setTokens()', function() {

    describe('using comma-separated string', function() {

      before(function() {
        TFT.template = '<input type="text" class="tokenize" value="red,green, blue" />';
      });

      beforeEach(function(){
        this.$field.tokenfield('setTokens', 'black,yellow,white');
      });

      after(function() {
        TFT.template = null;
      });

      it('should replace any existing tokens with new ones', function() {
        var tokens = this.$field.tokenfield('getTokens')
          , tokensList = this.$field.tokenfield('getTokensList');

        tokens.should.have.length(3);
        tokens[0].should.include.keys('label', 'value');
        tokens[0].label.should.equal('black');
        tokens[0].value.should.equal('black');

        tokensList.should.not.contain('red');

      });

      it('should set the original input value to comma-separated list of token values', function() {
        this.$field.val().should.equal('black, yellow, white');
      });
      
    });

    describe('using an array of string values', function() {

      before(function() {
        TFT.template = '<input type="text" class="tokenize" value="red,green, blue" />';
      });

      beforeEach(function(){
        this.$field.tokenfield('setTokens', 'black,yellow,white');
      });      

      after(function() {
        TFT.template = null;
      });

      it('should replace any existing tokens with new ones', function() {
        var tokens = this.$field.tokenfield('getTokens')
          , tokensList = this.$field.tokenfield('getTokensList');

        tokens.should.have.length(3);
        tokens[0].should.include.keys('label', 'value');
        tokens[0].label.should.equal('black');
        tokens[0].value.should.equal('black');

        tokensList.should.not.contain('red');

      });

      it('should set the original input value to comma-separated list of token values', function() {
        this.$field.val().should.equal('black, yellow, white');
      });

    });

    describe('using an array of token objects', function() {

      before(function() {
        TFT.template = '<input type="text" class="tokenize" value="red,green, blue" />';
      });

      beforeEach(function(){
        this.$field.tokenfield('setTokens', [{ value: "black", label: "Schwarz" }, { value: "yellow", label: "Gelb" }]);
      });      

      after(function() {
        TFT.template = null;
      });

      it('should replace any existing tokens with new ones', function() {
        this.$field.tokenfield('setTokens', [{ value: "black", label: "Schwarz" }, { value: "yellow", label: "Gelb" }]);

        var tokens = this.$field.tokenfield('getTokens')
          , tokensList = this.$field.tokenfield('getTokensList');

        tokens.should.have.length(2);
        tokens[0].should.include.keys('label', 'value');
        tokens[0].label.should.equal('Schwarz');
        tokens[0].value.should.equal('black');

        tokensList.should.not.contain('red');

      });

      it('should set the original input value to comma-separated list of token values', function() {
        this.$field.val().should.equal('black, yellow');
      });      

    });

  });

  describe('disable()', function() {

    beforeEach(function() {
      this.$field.tokenfield('disable');
    });

    it('should disable both original and token input', function() {
      this.$field.prop('disabled').should.be.true;
      this.$field.data('bs.tokenfield').$input.prop('disabled').should.be.true;
    });

    it('should add "disabled" class to tokenfield', function() {
      this.$field.data('bs.tokenfield').$wrapper.hasClass('disabled').should.be.true;
    });

  });  

  describe('enable()', function() {

    beforeEach(function() {
      this.$field.tokenfield('disable');
      this.$field.tokenfield('enable');
    });

    it('should enable both original and token input', function() {
      this.$field.prop('disabled').should.be.false;
      this.$field.data('bs.tokenfield').$input.prop('disabled').should.be.false;
    });

    it('should remove "disabled" class from tokenfield', function() {
      this.$field.data('bs.tokenfield').$wrapper.hasClass('disabled').should.be.false;
    });

  });  

});