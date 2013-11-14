// Global tokenfield test object
var TFT = {};

beforeEach(function() {
  var template = TFT.template || '<input type="text" class="tokenize" value="" />',
      options  = TFT.options  || null;

  this.$sandbox = $('<div />').appendTo($('body'));
  this.$template = $(template).appendTo(this.$sandbox);

  this.$field = this.$template.hasClass('tokenize') ? this.$template : this.$template.find('.tokenize');
  this.$field.tokenfield( options );

  // Shortcuts
  this.$input       = this.$field.data('bs.tokenfield').$input;
  this.$wrapper     = this.$field.data('bs.tokenfield').$wrapper;
  this.$copyHelper  = this.$field.data('bs.tokenfield').$copyHelper;
});

afterEach( function() {
  this.$sandbox.remove();

  delete this.$field;
  delete this.$input;
  delete this.$wrapper;
  delete this.$copyHelper;
  delete this.$sandbox;
  delete this.$template;
});