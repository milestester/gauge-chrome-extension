
// var tracker = TimeTracker.getInstance();

function objectEmpty(obj) {
 return (Object.keys(obj).length === 0 && obj.constructor === Object);
}

// function getDomainFromHostName(hostName) {
//   var splitHostName = hostName.split("www.")
//   if(splitHostName.length == 1) {
//     return splitHostName[0];
//   } else if(splitHostName.length == 2) {
//     return splitHostName[1];
//   }
// }

// function getDomainOfActiveTab(queryInfo, callback) {
//   chrome.tabs.query(queryInfo, function(tabs) {
//     if(tabs.length > 0) {
//       var url = new URL(tabs[0].url);
//       var hostName = url.hostname;
//       var domain = getDomainFromHostName(hostName);
//       callback(domain);
//     }
//   });
// }

// function handleActiveTab() {
//   var queryInfo = {active: true, currentWindow: true};
//   getDomainOfActiveTab(queryInfo, function(activeTabDomain) {
//     tracker.getCurrentPageDomain(function(previousPageDomain) {
//       if(previousPageDomain && (activeTabDomain != previousPageDomain)) {
//         var now = new Date();
//         var currentActiveTime = now.getTime();
//         tracker.getTrackedSite(activeTabDomain, function(siteObj) {
//           if(siteObj != null) {
//             // Current active tab is being tracked
//             siteObj.updateLastNavigatedTime(currentActiveTime);
//             siteObj.saveToLocalStorage();
//           } else {
//             // Current active tab not being tracked
//             tracker.getTrackedSite(previousPageDomain, function(prevTabSiteObj){
//               if(prevTabSiteObj != null) {
//                 // Previous tab was being tracked, so update its active time for today
//                 prevTabSiteObj.updateActiveTimeToday(currentActiveTime);
//                 prevTabSiteObj.saveToLocalStorage();
//               }
//             });
//           }
//         });
//       }
//       tracker.setCurrentPageDomain(activeTabDomain);
//     });
//   });
// }

// function sanitize() {
//   tracker.getAllFromLocalStorage(function(allObj) {
//     for(var property in allObj) {
//       if(allObj.hasOwnProperty(property) && property != "currentPageDomain" && property != "chromeHasFocus") {
//         var currentSite = allObj[property];
//         var s = new Site(property, currentSite["lastNavigatedTime"], currentSite["datesTracked"]);
//         var datesTracked = currentSite["datesTracked"];
//         var now = new Date();
//         now.setDate(now.getDate()-8);
//         s.removeDay(now.toLocaleDateString());
//         s.saveToLocalStorage();
//       }
//     }
//   });
// }

// Hack to get around focus change not firing again when chrome comes into focus
// function checkForInactivity() {
//   tracker.getFromLocalStorage("chromeHasFocus", function(focusBoolean){
//     if(focusBoolean == false) {
//       tracker.saveToLocalStorage("chromeHasFocus", true);
//       handleInactivity(handleActiveTab);
//     } else {
//       handleActiveTab();
//     }
//   });
// }

// // When click off, then click back on another tab, previous page
// // is set to new one..
// function handleInactivity(callback) {
//   tracker.getCurrentPageDomain(function(previousPageDomain) {
//     if(previousPageDomain) {
//       tracker.getTrackedSite(previousPageDomain, function(prevSiteObj) {
//         if(prevSiteObj) {
//           var now = new Date();
//           var currentActiveTime = now.getTime();
//           prevSiteObj.updateLastNavigatedTime(currentActiveTime);
//           prevSiteObj.saveToLocalStorage();
//         }
//       });
//     }
//     if(callback) {
//       callback();
//     }
//   });
// }

// chrome.tabs.onActivated.addListener(handleActiveTab);
// chrome.tabs.onUpdated.addListener(handleActiveTab);
// chrome.tabs.onActivated.addListener(checkForInactivity);
// chrome.tabs.onUpdated.addListener(checkForInactivity);
chrome.tabs.onActivated.addListener(TimeTrackerUpdated.handleActiveTab);
chrome.tabs.onUpdated.addListener(TimeTrackerUpdated.handleActiveTab);
chrome.runtime.onStartup.addListener(TimeTrackerUpdated.sanitizeWeeklyData);
chrome.runtime.onInstalled.addListener(TimeTrackerUpdated.sanitizeWeeklyData);
// chrome.windows.onFocusChanged.addListener(function(windowId){
//   console.log(windowId);
//   if(windowId == chrome.windows.WINDOW_ID_NONE) {
//     tracker.saveToLocalStorage("chromeHasFocus", false);
//   } else {
//     tracker.saveToLocalStorage("chromeHasFocus", true);
//     handleInactivity();
//   }
// });

// chrome.idle.setDetectionInterval(15);
// chrome.idle.onStateChanged.addListener(function(state) {
//   if(state == "active") {
//     handleInactivity();
//   }
// });

// var timeWasteArray = ["www.facebook.com", "twitter.com", "www.youtube.com"];
// if(!localStorage["timeWasteArray"]) {
//   localStorage["timeWasteArray"] =  JSON.stringify([]);
// }
// var timeWasteArray = JSON.parse(localStorage["timeWasteArray"]);

// function sanitize() {
//   for(var i = 0; i < timeWasteArray.length; i++) {
//     if(!localStorage[timeWasteArray[i]]) continue;
//     var obj = JSON.parse(localStorage[timeWasteArray[i]]);
//     var now = new Date();
//     var currentDate = now.toLocaleDateString();
//     var sevenDaysAgo = new Date();
//     sevenDaysAgo.setDate(sevenDaysAgo.getDate()-8);
//     if(localStorage[sevenDaysAgo.toLocaleDateString()]) {
//       localStorage.removeItem(sevenDaysAgo);
//     }
//   }
// }

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

// chrome.tabs.onActivated.addListener(getActiveTab);
// chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
//   if(changeInfo.status == "complete") {
//     getActiveTab();
//   }
// });
// chrome.runtime.onStartup.addListener(sanitize);
// chrome.runtime.onInstalled.addListener(sanitize);


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

TODO: sanitize in 7 days
inactivity after certain number of seconds, or if you click away from chrome
refresh even if dont click button again?

*/