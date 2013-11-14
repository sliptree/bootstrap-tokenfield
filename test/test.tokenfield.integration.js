describe('initializing tokenfield', function() {

  describe('with an alternative delimiter', function() {
    before(function() {
      TFT.template = '<input type="text" class="tokenize" value="red;green;blue;yellow" />'
      TFT.options = {
        delimiter: ';'
      }
    });

    after(function() {
      delete TFT.template;
      delete TFT.options;
    });

    it('should create tokens by splitting the original value with delimiters', function() {
      this.$field.data('bs.tokenfield').$wrapper.find('.token').length.should.equal(4);
    });

    it('should create a token when the delimiting key is pressed and use the first delimiter for setting original input value', function() {
      this.$field.data('bs.tokenfield').$input.focus().simulate("key-sequence", { sequence: "purple;olive;" })
      this.$field.data('bs.tokenfield').$wrapper.find('.token').length.should.equal(6);
      this.$field.val().should.equal('red; green; blue; yellow; purple; olive');
    });    
  })

  describe('with multiple alternative delimiters', function() {
    before(function() {
      TFT.template = '<input type="text" class="tokenize" value="red green blue.yellow" />'
      TFT.options = {
        delimiter: [' ', '.']
      }
    });

    after(function() {
      delete TFT.template;
      delete TFT.options;
    });

    it('should create tokens by splitting the original value with delimiters', function() {
      this.$field.data('bs.tokenfield').$wrapper.find('.token').length.should.equal(4);
    });

    it('should create a token when the delimiting key is pressed and use the first delimiter for setting original input value', function() {
      this.$field.data('bs.tokenfield').$input.focus().simulate("key-sequence", { sequence: "purple olive." })
      this.$field.data('bs.tokenfield').$wrapper.find('.token').length.should.equal(6);
      this.$field.val().should.equal('red green blue yellow purple olive');
    });
  });

});