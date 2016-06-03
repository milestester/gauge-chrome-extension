
function objectEmpty(obj) {
 return (Object.keys(obj).length === 0 && obj.constructor === Object);
}

chrome.tabs.onActivated.addListener(TimeTracker.checkForInactivity);
chrome.tabs.onUpdated.addListener(TimeTracker.checkForInactivity);
chrome.runtime.onStartup.addListener(TimeTracker.sanitizeWeeklyData);
chrome.runtime.onInstalled.addListener(TimeTracker.sanitizeWeeklyData);
chrome.windows.onFocusChanged.addListener(function(windowId){
  if(windowId == chrome.windows.WINDOW_ID_NONE) {
    LocalStorageManager.save("chromeHasFocus", false);
  } else {
    LocalStorageManager.save("chromeHasFocus", true);
    TimeTracker.handleInactivity();
  }
});

// Another work around for onFocusChanged not always firing
// Check every minute for browser focus
chrome.alarms.create("updateTime", {periodInMinutes: 1});
chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name == "updateTime") {
    chrome.windows.getCurrent(function(browser){
      if(browser.focused) {
        LocalStorageManager.save("chromeHasFocus", true);
      } else {
        LocalStorageManager.save("chromeHasFocus", false);
      }
    });
  }
});

// chrome.idle.setDetectionInterval(15);
// chrome.idle.onStateChanged.addListener(function(state) {
//   if(state == "active") {
//     handleInactivity();
//   }
// });

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