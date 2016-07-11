chrome.omnibox.onInputChanged.addListener(function(text, suggest){

  var searchTerm = modifySearch(text);
  console.log(searchTerm);
  var omdbAPI = 'http://www.omdbapi.com/?s=' + searchTerm;

  // slower API but also returns data about actors/actresses
  //var imdbAPI = 'http://imdb.wemakesites.net/api/search?q=' + searchTerm;

  var req = new XMLHttpRequest();
  req.open('GET', omdbAPI , true);
  req.send();

  var suggestions = [];

  req.onreadystatechange = function(){

    if(this.readyState === 4 && this.status == 200) {

      var data = JSON.parse(this.responseText);
      console.log(data);
      if(data.Response == "True"){

        data.Search.map(function(a){

          suggestions.push({
            content: 'http://www.imdb.com/title/' + a.imdbID,
            description: validateXML(a.Title + ' (' +a.Year + ')')
          });

        });
        suggest(suggestions);
      }
    }
  }

  chrome.omnibox.setDefaultSuggestion({
    description:  ('Search on IMDB: ' + text)
  })

});

function validateXML(string) {
  return string
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;');
}

//update the current tab when one of the suggestions is chosen
chrome.omnibox.onInputEntered.addListener(function(text){

  if(text.indexOf('/title/') == -1){
    var url =  'http://www.imdb.com/find?ref_=nv_sr_fn&q=' + modifySearch(text) + '&s=all';
    chrome.tabs.update({url: url});
  }

  else{
    chrome.tabs.update({url: text});
  }
});

chrome.omnibox.onInputCancelled.addListener(function(){
  chrome.omnibox.setDefaultSuggestion({description: ' '})
})

//removes empty spaces after text to show more accurate suggestions
function modifySearch(text){
  
  return text.trim().split(' ').join('+');

}
