if (Meteor.isClient) {
  Meteor.startup(function(){
    Session.set('targetLang', 'Dutch Female');
    Session.set('sourceLang', 'US English Female');
  });

  Template.hello.onRendered(function(){
    $('head').append('<script src="http://code.responsivevoice.org/responsivevoice.js"></script>');
  });

  Template.hello.events({
    'click button': function () {
      var text = document.getElementById('text').value;
      responsiveVoice.speak(text, Session.get('targetLang'));
    }
  });

  Template.words.helpers({
    words: function(){
      return DutchEnglishDict.find();
    }
  });
}
