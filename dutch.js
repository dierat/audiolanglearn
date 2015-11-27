DutchEnglishDict = new Mongo.Collection("dutchEnglishDict");


var dutchwordsSpreadsheetID = "1lWqfLC9bul0DDBmK4TOKR7S2H9A6ZDhtiwjVH0cytqo";
var url = "https://spreadsheets.google.com/feeds/list/" + dutchwordsSpreadsheetID + "/1/public/values?alt=json";


if (Meteor.isClient) {
  Meteor.startup(function () {

    if (DutchEnglishDict.find().count() === 0){
      $.getJSON(url, function(data) {
        Meteor.call('importDutch', data.feed.entry);
      });
    }

  });
}


Meteor.methods({
  importDutch: function(words){
    words.forEach(function(tuple){
      var nl = tuple.gsx$nl.$t;
      var en = tuple.gsx$en.$t;
      if (en !== "I") en = en.toLowerCase();
      // check if english word is valid using /usr/share/dict/words
      DutchEnglishDict.insert({
        nl: nl,
        en: en
      });
    });
  }
});
