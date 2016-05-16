/*
1. We want to check for tab activation and URL changing
2. Every day, start new local storage variable to 0, reset lastNavigatedTime [limit to 7 days??]
3. We want to check whether this new tab or URL is a "time wasted" website
   a. If it matches do the following:
      i. Measure the time that page became active, i.e. clicked or URL navigated
      ii. Subtract this time from the previously active time, e.g.
          Type in facebook.com at 12.00 pm, total time initially set to 0, lastNavigatedTime set to this time.
          When you navigate away from that page (i.e. go to one which isn't a "time wasted website") update its timer
          by substracting current time from previous time, set total time to this.

Local storage will look like:

{
  "facebook.com"  : {lastNavigatedTime: 12pm, totalTimeToday: 100, totalTimeYesterday ... , ],
  "twitter.com"   : {....}
  "currentPage"    : "facebook.com"
}

Check for inactivity [context scripts]
Check for multiple tabs
Clicking between wasted tabs

TODO: sanitize in 7 days
inactivity after certain number of seconds, or if you click away from chrome

*/

var timeWasteArray = ["www.facebook.com", "twitter.com", "www.youtube.com"];

function getActiveTab() {
  var queryInfo = {active: true, currentWindow: true};
  chrome.tabs.query(queryInfo, function(tabs) {
    if(tabs.length > 0) {
      var url = new URL(tabs[0].url);
      var hostName = url.hostname;
      if(timeWasteArray.indexOf(hostName) != -1) {
        // Current Tab IN blacklist
        if(localStorage["currentPage"] != hostName) {
          var now = new Date();
          var currentActiveTime = now.getTime();
          var obj = localStorage[hostName];
          if(obj) {
            obj = JSON.parse(obj);
            obj["lastNavigatedTime"] = currentActiveTime;
          } else {
            obj = {lastNavigatedTime: currentActiveTime};
            obj[now.toLocaleDateString()] = 0;
          }
          localStorage[hostName] = JSON.stringify(obj);
        }
      }
      // Current Tab NOT in blacklist
      var previousPage = localStorage["currentPage"];
      if(timeWasteArray.indexOf(previousPage) != -1) {
        var obj = localStorage[previousPage];
        if(obj) {
          var now = new Date();
          var currentActiveTime = now.getTime();
          obj = JSON.parse(obj);
          obj[now.toLocaleDateString()] += (currentActiveTime - obj["lastNavigatedTime"]);
          localStorage[previousPage] = JSON.stringify(obj);
        }
      }
      localStorage["currentPage"] = hostName;
    }
  });
}

chrome.tabs.onActivated.addListener(getActiveTab);
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if(changeInfo.status == "complete") {
    getActiveTab();
  }
});
