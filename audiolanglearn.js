UserDeck = new Mongo.Collection("userDeck");

if (Meteor.isClient) {
  Meteor.startup(()=> {
    Session.set('targetLang', 'Dutch Female');
    Session.set('sourceLang', 'US English Female');
  });

  Template.hello.onRendered(()=> {
    $('head').append('<script src="http://code.responsivevoice.org/responsivevoice.js"></script>');
  });

  Template.hello.events({
    'click button': ()=> {
      var text = document.getElementById('text').value;
      responsiveVoice.speak(text, Session.get('targetLang'));
    }
  });

  Template.words.helpers({
    words: ()=> DutchEnglishDict.find()
  });
}
