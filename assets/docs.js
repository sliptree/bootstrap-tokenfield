jQuery(function(){
  // Track downloads
  $('#download-master').click(function(){
    _trackEvent('Downloads', 'master');
  });
});

jQuery(document).ready(function($) {

  $('.token-example-field').tokenfield();

  $('#tokenfield-1').tokenfield({
    autocomplete: {
      source: ['red','blue','green','yellow','violet','brown','purple','black','white'],
      delay: 100
    },
    showAutocompleteOnFocus: true,
    allowDuplicates: true
  });

  $('#tokenfield-2')
  .on('beforeCreateToken', function (e) {
    var token = e.token.value.split('|')
    e.token.value = token[1] || token[0]
    e.token.label = token[1] ? token[0] + ' (' + token[1] + ')' : token[0]
  })
  .on('afterCreateToken', function (e) {
    // Über-simplistic e-mail validation
    var re = /\S+@\S+\.\S+/
    var valid = re.test(e.token.value)
    if (!valid) {
      $(e.relatedTarget).addClass('invalid')
    }
  })
  .on('beforeEditToken', function (e) {
    if (e.token.label !== e.token.value) {
      var label = e.token.label.split(' (')
      e.token.value = label[0] + '|' + e.token.value
    }
  })
  .on('removeToken', function () {
    alert('Token removed!')
  })
  .tokenfield()
  
});