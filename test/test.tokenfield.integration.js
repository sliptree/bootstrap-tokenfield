describe('Integration', function() {

  describe('Using an alternative delimiter', function() {
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
      this.$input.focus().simulate("key-sequence", { sequence: "purple;olive;" })
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
      this.$input.focus().simulate("key-sequence", { sequence: "purple olive." });
      this.$field.data('bs.tokenfield').$wrapper.find('.token').length.should.equal(6);
      this.$field.val().should.equal('red green blue yellow purple olive');
    });
  });

  describe('Keyboard interaction', function() {

    describe("Pressing Ctrl+A", function() {
      before(function() {
        TFT.template = '<input type="text" class="tokenize" value="red,green,blue" />'
      });

      after(function() {
        delete TFT.template;
      });

      it("should select all tokens", function() {
        this.$input.focus().simulate("key-combo", { combo: "ctrl+a" });
        this.$field.tokenfield('getTokens', true).length.should.equal(3);
      });
    });

    describe("pressing Cmd+A", function() {
      before(function() {
        TFT.template = '<input type="text" class="tokenize" value="red,green,blue" />'
      });

      after(function() {
        delete TFT.template;
      });

      it("should select all tokens", function() {
        this.$input.focus().simulate("key-combo", { combo: "meta+a" });
        this.$field.tokenfield('getTokens', true).length.should.equal(3);
      });
    });

    describe("Pressing delete", function() {
      describe("when a token is selected", function() {
        before(function() {
          TFT.template = '<input type="text" class="tokenize" value="red,green,blue,yellow" />'
        });

        after(function() {
          delete TFT.template;
        });

        describe('and there are more tokens to the right of selected token', function() {
          it("should delete the selected token and move focus to the next token", function() {
            // Mark green as active
            this.$wrapper.find('.token')
                .filter(':has(.token-label:contains(green))').addClass('active');

            this.$copyHelper.simulate("key-sequence", { sequence: "{del}" });
            this.$field.tokenfield('getTokens').length.should.equal(3);
            this.$field.tokenfield('getTokensList', null, null, true).should.equal('blue');
          });
        })

        describe('and there are no more tokens to the right of the selected token', function() {
          it("should delete the selected token and move focus to input", function() {
            // Mark green as active
            this.$wrapper.find('.token')
                .filter(':has(.token-label:contains(yellow))').addClass('active');

            this.$copyHelper.simulate("key-sequence", { sequence: "{del}" });
            this.$field.tokenfield('getTokens').length.should.equal(3);
            this.$field.tokenfield('getTokensList', null, null, true).should.equal('');
            this.$input.is(document.activeElement).should.be.true;
          });
        })
      });

      describe("when multiple tokens are selected", function() {
        before(function() {
          TFT.template = '<input type="text" class="tokenize" value="red,green,blue,yellow,purple" />'
        });

        after(function() {
          delete TFT.template;
        });

        describe('and there are more tokens to the right of selected tokens', function() {
          it("should delete the selected tokens and move focus to the next token of the rightmost selected token", function() {
            // Mark green and yellow as active
            this.$wrapper.find('.token')
                .filter(':has(.token-label:contains(green))').addClass('active');
            this.$wrapper.find('.token')
                .filter(':has(.token-label:contains(yellow))').addClass('active');

            this.$copyHelper.simulate("key-sequence", { sequence: "{del}" });
            this.$field.tokenfield('getTokens').length.should.equal(3);
            this.$field.tokenfield('getTokensList', null, null, true).should.equal('purple');
          });
        });

        describe('and there are no more tokens to the right of selected tokens', function() {
          it("should delete the selected tokens and move focus input", function() {
            // Mark green and yellow as active
            this.$wrapper.find('.token')
                .filter(':has(.token-label:contains(green))').addClass('active');
            this.$wrapper.find('.token')
                .filter(':has(.token-label:contains(purple))').addClass('active');

            this.$copyHelper.simulate("key-sequence", { sequence: "{del}" });
            this.$field.tokenfield('getTokens').length.should.equal(3);
            this.$field.tokenfield('getTokensList').should.equal('red, blue, yellow');
            this.$input.is(document.activeElement).should.be.true;

          });
        });
      });
    });

    describe("Pressing backspace", function() {
      describe("when a token is selected", function() {
        before(function() {
          TFT.template = '<input type="text" class="tokenize" value="red,green,blue,yellow" />'
        });

        after(function() {
          delete TFT.template;
        });

        describe('and there are more tokens to the left of selected token', function() {
          it("should delete the selected token and move focus to the previous token", function() {
            // Mark green as active
            this.$wrapper.find('.token')
                .filter(':has(.token-label:contains(blue))').addClass('active');

            this.$copyHelper.simulate("key-sequence", { sequence: "{backspace}" });
            this.$field.tokenfield('getTokens').length.should.equal(3);
            this.$field.tokenfield('getTokensList', null, null, true).should.equal('green');
          });
        })

        describe('and there are no more tokens to the left of the selected token', function() {
          it("should delete the selected token and move focus to input", function() {
            // Mark green as active
            this.$wrapper.find('.token')
                .filter(':has(.token-label:contains(red))').addClass('active');

            this.$copyHelper.simulate("key-sequence", { sequence: "{backspace}" });
            this.$field.tokenfield('getTokens').length.should.equal(3);
            this.$field.tokenfield('getTokensList', null, null, true).should.equal('');
            this.$input.is(document.activeElement).should.be.true;
          });
        })
      });

      describe("when multiple tokens are selected", function() {
        before(function() {
          TFT.template = '<input type="text" class="tokenize" value="red,green,blue,yellow,purple" />'
        });

        after(function() {
          delete TFT.template;
        });

        describe('and there are more tokens to the left of selected tokens', function() {
          it("should delete the selected tokens and move focus to the previous token of the leftmost selected token", function() {
            // Mark green and yellow as active
            this.$wrapper.find('.token')
                .filter(':has(.token-label:contains(green))').addClass('active');
            this.$wrapper.find('.token')
                .filter(':has(.token-label:contains(yellow))').addClass('active');

            this.$copyHelper.simulate("key-sequence", { sequence: "{backspace}" });
            this.$field.tokenfield('getTokens').length.should.equal(3);
            this.$field.tokenfield('getTokensList', null, null, true).should.equal('red');
          });
        });

        describe('and there are no more tokens to the left of selected tokens', function() {
          it("should delete the selected tokens and move focus input", function() {
            // Mark green and yellow as active
            this.$wrapper.find('.token')
                .filter(':has(.token-label:contains(red))').addClass('active');
            this.$wrapper.find('.token')
                .filter(':has(.token-label:contains(purple))').addClass('active');

            this.$copyHelper.simulate("key-sequence", { sequence: "{backspace}" });
            this.$field.tokenfield('getTokens').length.should.equal(3);
            this.$field.tokenfield('getTokensList').should.equal('green, blue, yellow');
            this.$input.is(document.activeElement).should.be.true;
          });
        });
      });

      describe("when focus is on input", function() {
        before(function() {
          TFT.template = '<input type="text" class="tokenize" value="red,green,blue" />'
        });

        after(function() {
          delete TFT.template;
        });

        it("should move focus to the last token", function() {
          this.$input.simulate("key-sequence", { sequence: "{backspace}" });
          this.$field.tokenfield('getTokensList', null, null, true ).should.equal('blue');
        });
      });
    });

    describe("Pressing left arrow key", function() {
      describe("when no tokens are selected", function() {
        before(function() {
          TFT.template = '<input type="text" class="tokenize" value="red,green,blue" />'
        });

        after(function() {
          delete TFT.template;
        });

        it("should move focus to the last token", function() {
          this.$input.simulate("key-sequence", { sequence: "{leftarrow}" });
          this.$field.tokenfield('getTokensList', null, null, true ).should.equal('blue');
        });
      });

      describe("when a token is selected", function() {
        before(function() {
          TFT.template = '<input type="text" class="tokenize" value="red,green,blue" />'
        });

        after(function() {
          delete TFT.template;
        });

        it("should move focus to the previous token", function() {
          this.$wrapper.find('.token')
              .filter(':has(.token-label:contains(blue))').addClass('active');

          this.$copyHelper.simulate("key-sequence", { sequence: "{leftarrow}" });
          this.$field.tokenfield('getTokensList', null, null, true ).should.equal('green');
        });
      });

      describe("when multiple tokens are selected", function() {
        before(function() {
          TFT.template = '<input type="text" class="tokenize" value="red,green,blue,yellow" />'
        });

        after(function() {
          delete TFT.template;
        });

        it("should move focus to the previous token of the leftmost selected token", function() {
          this.$wrapper.find('.token')
              .filter(':has(.token-label:contains(green))').addClass('active');
          this.$wrapper.find('.token')
              .filter(':has(.token-label:contains(yellow))').addClass('active');
                  
          this.$copyHelper.simulate("key-sequence", { sequence: "{leftarrow}" });
          this.$field.tokenfield('getTokensList', null, null, true ).should.equal('red');
        });
      });

      describe("when the first token is selected", function() {
        before(function() {
          TFT.template = '<input type="text" class="tokenize" value="red,green,blue" />'
        });

        after(function() {
          delete TFT.template;
        });

        it("should keep the focus on the first token", function() {
          this.$wrapper.find('.token')
              .filter(':has(.token-label:contains(red))').addClass('active');

          this.$copyHelper.simulate("key-sequence", { sequence: "{leftarrow}" });
          this.$field.tokenfield('getTokensList', null, null, true ).should.equal('red');
        });
      });
    });

    describe("Pressing right arrow key", function() {
      describe("when no tokens are selected", function() {
        before(function() {
          TFT.template = '<input type="text" class="tokenize" value="red,green,blue" />'
        });

        after(function() {
          delete TFT.template;
        });

        it("should keep the focus on the input", function() {
          this.$input.simulate("key-sequence", { sequence: "{rightarrow}" });
          this.$field.tokenfield('getTokensList', null, null, true ).should.equal('');          
          this.$input.is(document.activeElement).should.be.true;
        });
      });

      describe("when a token is selected", function() {
        before(function() {
          TFT.template = '<input type="text" class="tokenize" value="red,green,blue" />'
        });

        after(function() {
          delete TFT.template;
        });

        it("should move focus to the next token", function() {
          this.$wrapper.find('.token')
              .filter(':has(.token-label:contains(red))').addClass('active');
                  
          this.$copyHelper.simulate("key-sequence", { sequence: "{rightarrow}" });
          this.$field.tokenfield('getTokensList', null, null, true ).should.equal('green');
        });
      });

      describe("when multiple tokens are selected", function() {
        before(function() {
          TFT.template = '<input type="text" class="tokenize" value="red,green,blue,yellow" />'
        });

        after(function() {
          delete TFT.template;
        });

        it("should move focus to the next token of the rightmost selected token", function() {
          this.$wrapper.find('.token')
              .filter(':has(.token-label:contains(red))').addClass('active');
          this.$wrapper.find('.token')
              .filter(':has(.token-label:contains(blue))').addClass('active');
                  
          this.$copyHelper.simulate("key-sequence", { sequence: "{rightarrow}" });
          this.$field.tokenfield('getTokensList', null, null, true ).should.equal('yellow');
        });
      });

      describe("when the last token is selected", function() {
        before(function() {
          TFT.template = '<input type="text" class="tokenize" value="red,green,blue" />'
        });

        after(function() {
          delete TFT.template;
        });

        it("should move the focus to the input", function() {
          this.$wrapper.find('.token')
              .filter(':has(.token-label:contains(blue))').addClass('active');
                  
          this.$copyHelper.simulate("key-sequence", { sequence: "{rightarrow}" });
          this.$field.tokenfield('getTokensList', null, null, true ).should.equal('');
          this.$input.is(document.activeElement).should.be.true;
        });
      });
    });

    describe("Pressing Shift + left arrow key", function() {
      describe("when no tokens are selected", function() {
        before(function() {
          TFT.template = '<input type="text" class="tokenize" value="red,green,blue" />'
        });

        after(function() {
          delete TFT.template;
        });

        it("should move focus to the last token", function() {
          this.$input.focus().simulate("keydown", { keyCode: 37, charCode: 37, shiftKey: true });
          this.$field.tokenfield('getTokensList', null, null, true ).should.equal('blue');
        });
      });

      describe("when a token is selected", function() {
        before(function() {
          TFT.template = '<input type="text" class="tokenize" value="red,green,blue" />'
        });

        after(function() {
          delete TFT.template;
        });

        it("should activate the previous token in addition to the already active token", function() {
          this.$wrapper.find('.token')
              .filter(':has(.token-label:contains(blue))').addClass('active');

          this.$copyHelper.focus()
                          .simulate("keydown", { keyCode: 37, shiftKey: true })
                          .simulate("keydown", { keyCode: 37, shiftKey: true });
          this.$field.tokenfield('getTokensList', null, null, true ).should.equal('red, green, blue');
        });
      });

      describe("when multiple, non-adjacent tokens are selected", function() {
        before(function() {
          TFT.template = '<input type="text" class="tokenize" value="red,green,blue,yellow,purple" />'
        });

        after(function() {
          delete TFT.template;
        });

        it("should move select the previous token of the leftmost selected token in addition to the already selected tokens", function() {
          this.$wrapper.find('.token')
              .filter(':has(.token-label:contains(green))').addClass('active');
          this.$wrapper.find('.token')
              .filter(':has(.token-label:contains(yellow))').addClass('active');

          this.$copyHelper.focus().simulate("keydown", { keyCode: 37, shiftKey: true });
          this.$field.tokenfield('getTokensList', null, null, true ).should.equal('red, green, yellow');
        });
      });     
    });

    describe("Pressing Shift + right arrow key", function() {
      describe("when a token is selected", function() {
        before(function() {
          TFT.template = '<input type="text" class="tokenize" value="red,green,blue" />'
        });

        after(function() {
          delete TFT.template;
        });

        it("should activate the next token in addition to the already active token", function() {
          this.$wrapper.find('.token')
              .filter(':has(.token-label:contains(red))').addClass('active');

          this.$copyHelper.focus()
                          .simulate("keydown", { keyCode: 39, shiftKey: true })
                          .simulate("keydown", { keyCode: 39, shiftKey: true });
          this.$field.tokenfield('getTokensList', null, null, true ).should.equal('red, green, blue');
        });
      });

      describe("when multiple, non-adjacent tokens are selected", function() {
        before(function() {
          TFT.template = '<input type="text" class="tokenize" value="red,green,blue,yellow,purple" />'
        });

        after(function() {
          delete TFT.template;
        });

        it("should move select the next token of the rightmost selected token in addition to the already selected tokens", function() {
          this.$wrapper.find('.token')
              .filter(':has(.token-label:contains(green))').addClass('active');
          this.$wrapper.find('.token')
              .filter(':has(.token-label:contains(yellow))').addClass('active');

          this.$copyHelper.focus().simulate("keydown", { keyCode: 39, shiftKey: true });
          this.$field.tokenfield('getTokensList', null, null, true ).should.equal('green, yellow, purple');
        });
      });
    });

    describe("Pressing Enter key", function() {
      describe("when a token is selected", function() {
        before(function() {
          TFT.template = '<input type="text" class="tokenize" value="red,green,blue" />'
        });

        after(function() {
          delete TFT.template;
        });

        it("should enter edit mode for the active token", function() {
          this.$wrapper.find('.token')
              .filter(':has(.token-label:contains(green))').addClass('active');

          this.$copyHelper.simulate("key-sequence", { sequence: "{enter}" });
          this.$input.data('edit').should.be.true;
          this.$input.prev(':contains(red)').should.have.length(1);
          this.$input.next(':contains(blue)').should.have.length(1);
        });
      });

      describe("when input has text", function() {
        before(function() {
          TFT.template = '<input type="text" class="tokenize" value="red,green,blue" />'
        });

        after(function() {
          delete TFT.template;
        });

        it("should create a new token from the input", function() {

          this.$input.simulate("key-sequence", { sequence: "purple{enter}" });
          this.$field.tokenfield('getTokens').should.have.length(4);
        });
      });
    });

    describe("Pressing Tab key", function() {
      describe("when input has text", function() {
        before(function() {
          TFT.template = '<input type="text" class="tokenize" value="red,green,blue" />'
        });

        after(function() {
          delete TFT.template;
        });

        it("should create a new token from the input", function() {

          this.$input.focus().simulate("key-sequence", { sequence: "purple" });
          this.$input.simulate("keydown", { keyCode: 9 });
          this.$field.tokenfield('getTokens').should.have.length(4);
        });
      });
    });

  });

  describe("Mouse interaction", function() {

    describe("Clicking on a token", function() {
      before(function() {
        TFT.template = '<input type="text" class="tokenize" value="red,green,blue" />'
      });

      after(function() {
        delete TFT.template;
      });

      it("should select the token and deactivate any other active tokens", function() {
        this.$wrapper.find('.token')
            .filter(':has(.token-label:contains(green))').addClass('active');

        this.$wrapper.find('.token:contains(red)').click();
        this.$field.tokenfield('getTokensList', null, null, true ).should.equal('red');
      });
    });

    describe("Clicking on a token's remove icon", function() {
      before(function() {
        TFT.template = '<input type="text" class="tokenize" value="red,green,blue" />'
      });

      after(function() {
        delete TFT.template;
      });

      it("should remove the token", function() {                
        this.$wrapper.find('.token:contains(red)').find('.close').click();
        this.$field.tokenfield('getTokensList' ).should.equal('green, blue');
      });
    });

    describe("Double-clicking on a token", function() {
      before(function() {
        TFT.template = '<input type="text" class="tokenize" value="red,green,blue" />'
      });

      after(function() {
        delete TFT.template;
      });

      it("should enter the edit mode of the token", function() {
        this.$wrapper.find('.token')
            .filter(':has(.token-label:contains(green))').addClass('active');
                
        this.$wrapper.find('.token:contains(red)').dblclick();
        this.$input.data('edit').should.be.true;
        this.$input.next(':contains(green)').should.have.length(1);        
      });
    });

    describe("Ctrl-clicking on a token when another token is selected", function() {
      before(function() {
        TFT.template = '<input type="text" class="tokenize" value="red,green,blue" />'
      });

      after(function() {
        delete TFT.template;
      });

      it("should activate the token in addition to the already active token", function() {
        this.$wrapper.find('.token')
            .filter(':has(.token-label:contains(green))').addClass('active');
                
        this.$wrapper.find('.token:contains(red)').simulate('click', { ctrlKey: true });
        this.$field.tokenfield('getTokensList', null, null, true ).should.equal('red, green');
      });
    }); 

    describe("Shift-clicking on a token when another token is selected", function() {
      before(function() {
        TFT.template = '<input type="text" class="tokenize" value="red,green,blue" />'
      });

      after(function() {
        delete TFT.template;
      });

      it("should activate the token and all the tokens between the already active token", function() {
        this.$wrapper.find('.token:contains(blue)').simulate('click');
        this.$wrapper.find('.token:contains(red)').simulate('click', { shiftKey: true });
        this.$field.tokenfield('getTokensList', null, null, true ).should.equal('red, green, blue');
      });
    });

    describe("Pressing enter with when there is no input", function() {
      var submitted = false;

      before(function() {
        TFT.template = '<form method="post" action=""><input type="text" class="tokenize" value="red,green,blue" /><input type="submit"></form>';
      });

      after(function() {
        delete TFT.template;
      });      

      beforeEach(function() {
        this.$sandbox.find('form').on('submit', function(e) {
          submitted = true;
          event.preventDefault();
          return false;
        });
        this.$input.focus().simulate("key-sequence", { sequence: "{enter}" });
      });

      it("should submit the underlying form", function() {
        submitted.should.equal(true);
      });
    });

  });

  describe("Duplicates", function() {
    
    describe("Setting allowDuplicates to false", function() {
      var submitted = false;

      before(function() {
        TFT.template = '<form method="post" action=""><input type="text" class="tokenize" value="red,green,blue" /><input type="submit"></form>';
        TFT.options = { allowDuplicates: false }
      });

      after(function() {
        delete TFT.template;
        delete TFT.options;
      });

      beforeEach(function() {
        this.$sandbox.find('form').on('submit', function(e) {
          submitted = true;
          event.preventDefault()
          return false;
        });      
        this.$input.focus().simulate("key-sequence", { sequence: "red{enter}" });
      });

      it("should not create a duplicate token", function() {
        this.$field.tokenfield('getTokensList').should.equal('red, green, blue');
      });

      it("should add duplicate class to the existing token", function() {
        this.$sandbox.find( '.token[data-value="red"]' ).hasClass('duplicate').should.equal(true);
      });

      it("should keep the duplicate value in the input", function() {
        this.$input.val().should.equal('red');
      });

      it("should not submit the form when pressing enter", function(done) {
        setTimeout(function() {
          submitted.should.equal(false);
          done();
        }, 1);
      });
    });
    
    describe("Setting allowDuplicates to true", function() {
      var submitted = false;

      before(function() {
        TFT.template = '<form method="post" action=""><input type="text" class="tokenize" value="red,green,blue" /><input type="submit"></form>';
        TFT.options = { allowDuplicates: true }
      });

      after(function() {
        delete TFT.template;
        delete TFT.options;
      });

      beforeEach(function() {
        this.$sandbox.find('form').on('submit', function (event) {
          submitted = true;
          event.preventDefault()
          return false;
        });
        this.$input.focus().simulate("key-sequence", { sequence: "red{enter}" });
      });

      it("should create a duplicate token", function() {
        this.$field.tokenfield('getTokensList').should.equal('red, green, blue, red');
      });

      it("should not keep the duplicate value in the input", function() {
        this.$input.val().should.equal('');
      });

      it("should not submit the form when pressing enter", function(done) {
        setTimeout(function() {
          submitted.should.equal(false);
          done();
        }, 1);
      });
    });

  });

});