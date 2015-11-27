UsersDeck = new Mongo.Collection("userDeck");

if (Meteor.isClient) {
  Meteor.startup(()=> {
    Session.setDefault('correct', false);
    Session.setDefault('incorrect', false);

    Session.set('targetLang', 'Dutch Female');
    Session.set('sourceLang', 'US English Female');
  });

  // Login requires username instead of e-mail address for easier testing.
  Accounts.ui.config({
    passwordSignupFields: "USERNAME_ONLY"
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
    // TODO: change this to accept the names of the collections for all the
    // cards and for the users cards
    words: function () {
      const date = new Date();
      // Find the cards in the UsersDeck that have a timestamp earlier than now,
      // sort them in ascending order, and take the first one (if there is one)
      let ref_card = UsersDeck.findOne({user_id: Meteor.userId(), time: {$lt: date}}, {sort: {time: 1}});
      // If there was a card with a timestamp earlier than now, return it.
      if (ref_card) return DutchEnglishDict.find({_id: ref_card.card_id});
      else {
        // Finds number of cards currently in play,
        const usersDeckCount = UsersDeck.find({user_id: Meteor.userId()}).count();
        // then gets the next card from the DutchEnglishDict.
        const waiting_card = DutchEnglishDict.find({order: usersDeckCount});
        // If there was a card in the DutchEnglishDict, return it.
        if (waiting_card.count()) return waiting_card;
        else {
          // Otherwise, get the card in the user's card with the oldest timestamp.
          ref_card = UsersDeck.findOne({user_id: Meteor.userId()}, {sort: {time: 1}});
          if (ref_card) return DutchEnglishDict.find({_id: ref_card.card_id});
        }
      }
    },
    showMeaning: function(){
      const userHasntSeenIt = !UsersDeck.findOne({
        user_id: Meteor.userId(),
        card_id: this._id
      });
      return Session.get("incorrect") || userHasntSeenIt;
    },
    showCongratulations: ()=> Session.get('correct'),
  });
}
