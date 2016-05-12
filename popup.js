
document.addEventListener('DOMContentLoaded', function() {
  getCurrentTabUrl(function(tabs) {
    var currentTabs = "<p>Current Tabs Open: " + "<ul>";
    for(var i = 0; i < tabs.length; i++) {
      currentTabs += "<li>" + tabs[i].title + "</li>";
    }
    currentTabs += "</ul>";
    document.getElementById('status').innerHTML = currentTabs;
  });
});

function getCurrentTabUrl(callback) {
  var queryInfo = {
    // active: true,
    // currentWindow: true,
    // url: "https://*.facebook.com/"
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    callback(tabs);
  });
}

function getImageUrl(searchTerm, callback, errorCallback) {
  callback(imageUrl, 20, 20);
}

function renderStatus(statusText) {
  document.getElementById('status').innerText = statusText;
}
