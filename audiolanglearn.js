UsersDeck = new Mongo.Collection("userDeck");



// 'time_levels' is an array containing the number of seconds that will transpire
// before a card will be shown again. Each time a card is answered correctly, the
// length of time before it is shown again will double.
time_levels = [15.0, 30.0, 60.0, 120.0, 240.0, 480.0, 960.0, 1920.0, 3840.0,
  7680.0, 15360.0, 30720.0, 61440.0, 122880.0, 245760.0, 491520.0, 983040.0,
  1966080.0, 3932160.0, 7864320.0];



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

  Template.words.events({
    // When submitting an answer,
    'submit .answer': function (event) {
      event.preventDefault();
      // get the user's answer
      const answer = event.target.text.value;
      console.log("answer = ", answer);
      // and make sure something was submitted before continuing.
      if (answer.length) {
        // If the answer is correct,
        console.log("this = ", this);
        // TODO: 'this' is an empty object; why?
        // maybe this event needs to be attached to a template that's just
        // for the specific word we're showing
        // or use #with
        if (answer.toLowerCase() === this.en.toLowerCase()) {
          console.log("correct!");
          Session.set('correct', true);
          // wait two seconds before
          Meteor.setTimeout(function(){
            // increasing the card's level by one and updating the timestamp,
            const ref_card = UsersDeck.findOne({user_id: Meteor.userId(), card_id: this._id});
            const new_time = new Date(+new Date() + (time_levels[ref_card.level] + 1)*1000);
            // TODO: if ref_card doesn't exist, insert the card instead of
            // updating it
            UsersDeck.update(ref_card._id, {$inc: {level: 1}, $set: {time: new_time}});
            // and setting the Session's 'answered' value to false (for the next card)
            Session.set('correct', false);
          }.bind(this), 1250);
        // If the answer was false,
        } else {
          // tell the client that so it can show the correct answer.
          Session.set('incorrect', false);
        }
        // This overrides the default form return function.
      }
      return false;
    }
  });
}
