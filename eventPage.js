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
Check for multiple tabs - done
Clicking between wasted tabs - done

TODO: sanitize in 7 days - done
inactivity after certain number of seconds, or if you click away from chrome
refresh even if dont click button again?

1. BUG WITH HOW TIME WASTED ARRAY WORKS
2. INACTIVITY, WHEN CLICK AWAY FROM CHROME
3. CLASS FOR STORED OBJECTS
4. hostname only after www

*/

function objectEmpty(obj) {
 return (Object.keys(obj).length === 0 && obj.constructor === Object);
}

function saveToLocalStorage(items, callback) {
  chrome.storage.sync.set(items, callback);
}

function getFromLocalStorage(key, callback) {
  chrome.storage.sync.get(key, function(obj) {
    if(objectEmpty(obj)) {
      callback(null);
    } else {
      callback(obj[key]);
    }
  });
}

function removeFromLocalStorage(key, callback) {
  chrome.storage.sync.remove(key, callback);
}

function initilizeTimeWasteArray(items) {
  if(items == null || objectEmpty(items)) {
    saveToLocalStorage({"timeWasteArray": []}, function() {
      console.log("Initialized Time Waste Array");
    });
  }
}

function sanitize() {
  getFromLocalStorage("timeWasteArray", function(timeWasteArray) {
    if(timeWasteArray) {
      console.log(timeWasteArray);
      for(var i = 0; i < timeWasteArray.length; i++) {
        getFromLocalStorage(timeWasteArray[i], function(siteData) {
          if(siteData) {
            console.log(siteData);
            var now = new Date();
            var currentDate = now.toLocaleDateString();
            now.setDate(now.getDate()-8);
            var eightDaysAgo = now.toLocaleDateString();
            if(siteData[eightDaysAgo]) {
              delete siteData[eightDaysAgo];
              var res = {};
              res[timeWasteArray[i]] = siteData;
              saveToLocalStorage(res, function() {
                console.log("Eight day removed");
              });
            }
          }
        });
      }
    }
  });
}

function getDomainFromHostName(hostName) {
  var splitHostName = hostName.split("www.")
  if(splitHostName.length == 1) {
    return splitHostName[0];
  } else if(splitHostName.length == 2) {
    return splitHostName[1];
  }
}

function getActiveTab() {
  var queryInfo = {active: true, currentWindow: true};
  chrome.tabs.query(queryInfo, function(tabs) {
    if(tabs.length > 0) {
      var url = new URL(tabs[0].url);
      var hostName = url.hostname;
      var domain = getDomainFromHostName(hostName);
      console.log("Current Domain: " + domain);
      getFromLocalStorage("currentPage", function(previousPage) {
        if(previousPage) {
          console.log("Prev Page: " + previousPage);
          var now = new Date();
          var currentActiveTime = now.getTime();
          if(previousPage != domain) {
            getFromLocalStorage("timeWasteArray", function(timeWasteArray) {
              if(timeWasteArray) {
                console.log(timeWasteArray);
                // If current domain is in time waste array
                // Set last navigated time to now
                if(timeWasteArray.indexOf(domain) != -1) {
                  getFromLocalStorage(domain, function(siteData) {
                    console.log(siteData);
                    if(siteData) {
                      siteData["lastNavigatedTime"] = currentActiveTime;
                    } else {
                      siteData = {};
                      siteData["lastNavigatedTime"] = currentActiveTime;
                      siteData[now.toLocaleDateString()] = 0;
                    }
                    var toSave = {};
                    toSave[domain] = siteData;
                    saveToLocalStorage(toSave, function() {
                      console.log("Updated lastNavigatedTime for " + domain);
                    });
                  });
                }
                // Current Tab NOT in blacklist, if not in same host, update time spent on page
                if(timeWasteArray.indexOf(previousPage) != -1) {
                  console.log("Ready to update " + previousPage);
                  getFromLocalStorage(previousPage, function(siteData) {
                    if(siteData) {
                      console.log("Site data for " + previousPage);
                      console.log(siteData);
                      if(!siteData[now.toLocaleDateString()]) siteData[now.toLocaleDateString()] = 0;
                      siteData[now.toLocaleDateString()] += (currentActiveTime - siteData["lastNavigatedTime"]);
                      toSave = {};
                      toSave[previousPage] = siteData;
                      saveToLocalStorage(toSave, function() {
                        console.log("Updated time spent on page for domain " + domain);
                      });
                    }
                  });
                }
              }
            });
          }
        }
        saveToLocalStorage({"currentPage": domain}, function() {
          console.log("updated current page");
        });
      });
    }
  });
}

getFromLocalStorage("timeWasteArray", initilizeTimeWasteArray);
chrome.runtime.onStartup.addListener(sanitize);
chrome.runtime.onInstalled.addListener(sanitize);
chrome.tabs.onActivated.addListener(getActiveTab);
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if(changeInfo.status == "complete") {
    getActiveTab();
  }
});
