DutchEnglishDict = new Mongo.Collection("dutchEnglishDict");


const dutchwordsSpreadsheetID = "1lWqfLC9bul0DDBmK4TOKR7S2H9A6ZDhtiwjVH0cytqo";
const url = "https://spreadsheets.google.com/feeds/list/" + dutchwordsSpreadsheetID + "/1/public/values?alt=json";


if (Meteor.isClient) {
  getDutch = ()=> {
    $.getJSON( url, (data)=> Meteor.call('importDutch', data.feed.entry) );
  };
}


Meteor.methods({
  importDutch: (words)=> {
    let counter = 0;
    words.forEach(function(tuple){
      const nl = tuple.gsx$nl.$t;
      let en = tuple.gsx$en.$t;
      if (en !== "I") en = en.toLowerCase();
      // check if english word is valid using /usr/share/dict/words
      DutchEnglishDict.insert({
        nl: nl,
        en: en,
        order: counter
      });
      counter++;
    });
  },
  emptyDutch: ()=> DutchEnglishDict.remove({})
});
