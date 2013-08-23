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
    showAutocompleteOnFocus: true
  });

  $('#tokenfield-2').tokenfield()
  .on('beforeCreateToken', function (e) {
    e.token.label = 'Something else'
  })
  .on('beforeEditToken', function (e) {
    e.token.value = 'Edit this instead'
  })
  .on('removeToken', function () {
    alert('Token removed!')
  })
  
});