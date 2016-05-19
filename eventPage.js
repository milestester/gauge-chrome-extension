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

// var timeWasteArray = ["www.facebook.com", "twitter.com", "www.youtube.com"];
getFromLocalStorage("timeWasteArray", initilizeTimeWasteArray);

function initilizeTimeWasteArray(items) {
 if(Object.keys(items).length === 0 && items.constructor === Object) {
    chrome.storage.sync.set({"timeWasteArray": []}, function() {
      console.log('Initialized Time Waste Array');
    });
  }
}

// chrome.storage.sync.get("timeWasteArray", function(items) {
//   if(Object.keys(items).length === 0 && items.constructor === Object) {
//     chrome.storage.sync.set({"timeWasteArray": []}, function() {
//       console.log('Initialized Time Waste Array');
//     });
//   }
// });

// if(!localStorage["timeWasteArray"]) {
//   localStorage["timeWasteArray"] =  JSON.stringify([]);
// }
// var timeWasteArray = JSON.parse(localStorage["timeWasteArray"]);

function sanitize() {
  for(var i = 0; i < timeWasteArray.length; i++) {
    if(!localStorage[timeWasteArray[i]]) continue;
    var obj = JSON.parse(localStorage[timeWasteArray[i]]);
    var now = new Date();
    var currentDate = now.toLocaleDateString();
    var sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate()-8);
    if(localStorage[sevenDaysAgo.toLocaleDateString()]) {
      localStorage.removeItem(sevenDaysAgo);
    }
  }
}

function getActiveTab() {
  var queryInfo = {active: true, currentWindow: true};
  chrome.tabs.query(queryInfo, function(tabs) {
    if(tabs.length > 0) {
      var url = new URL(tabs[0].url);
      var hostName = url.hostname;
      getFromLocalStorage("currentPage", function(page) {
        var now = new Date();
        var currentActiveTime = now.getTime();
        var previousPage = page.currentPage;
        if(previousPage != hostName) {
          getFromLocalStorage("timeWasteArray", function(timeWasteArray) {
            var timeWasteArray = timeWasteArray.timeWasteArray;
            getFromLocalStorage(hostName, function(obj) {
              if(timeWasteArray.indexOf(hostName) != -1) {
                if(!objectEmpty(obj)) {
                  obj = obj[hostName];
                  obj["lastNavigatedTime"] = currentActiveTime;
                } else {
                  obj = {lastNavigatedTime: currentActiveTime};
                  obj[now.toLocaleDateString()] = 0;
                }
                var temp = {};
                temp[hostName] = obj;
                saveToLocalStorage(temp);
              }
            });
            // Current Tab NOT in blacklist, if not in same host, update time spent on page
            if(timeWasteArray.indexOf(previousPage) != -1) {
              getFromLocalStorage(previousPage, function(obj) {
                obj = obj[previousPage];
                if(obj) {
                  obj[now.toLocaleDateString()] += (currentActiveTime - obj["lastNavigatedTime"]);
                  var temp = {};
                  temp[previousPage] = obj;
                  saveToLocalStorage(temp);
                }
              });
            }
          });
        }
        saveToLocalStorage({"currentPage": hostName});
      });
    }
  });
}

// function getActiveTab() {
//   var queryInfo = {active: true, currentWindow: true};
//   chrome.tabs.query(queryInfo, function(tabs) {
//     if(tabs.length > 0) {
//       var url = new URL(tabs[0].url);
//       var hostName = url.hostname;
//       var previousPage = localStorage["currentPage"];
//       var now = new Date();
//       var currentActiveTime = now.getTime();
//       if(previousPage != hostName) {
//         if(timeWasteArray.indexOf(hostName) != -1) {
//           // Current Tab IN blacklist, set time navigated to now
//           var obj = localStorage[hostName];
//           if(obj) {
//             obj = JSON.parse(obj);
//             obj["lastNavigatedTime"] = currentActiveTime;
//           } else {
//             obj = {lastNavigatedTime: currentActiveTime};
//             obj[now.toLocaleDateString()] = 0;
//           }
//           localStorage[hostName] = JSON.stringify(obj);
//         }
//         // Current Tab NOT in blacklist, if not in same host, update time spent on page
//         if(timeWasteArray.indexOf(previousPage) != -1) {
//           var obj = localStorage[previousPage];
//           if(obj) {
//             obj = JSON.parse(obj);
//             obj[now.toLocaleDateString()] += (currentActiveTime - obj["lastNavigatedTime"]);
//             localStorage[previousPage] = JSON.stringify(obj);
//           }
//         }
//       }
//       localStorage["currentPage"] = hostName;
//     }
//   });
// }

chrome.tabs.onActivated.addListener(getActiveTab);
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if(changeInfo.status == "complete") {
    getActiveTab();
  }
});
// chrome.runtime.onStartup.addListener(sanitize);
// chrome.runtime.onInstalled.addListener(sanitize);

function objectEmpty(obj) {
 return (Object.keys(obj).length === 0 && obj.constructor === Object);
}

function saveToLocalStorage(items, callback) {
  chrome.storage.sync.set(items, callback);
}

function getFromLocalStorage(key, callback) {
  chrome.storage.sync.get(key, callback);
}

function removeFromLocalStorage(key, callback) {
  chrome.storage.sync.remove(key, callback);
}
