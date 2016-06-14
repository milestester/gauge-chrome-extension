chrome.tabs.onActivated.addListener(TimeTracker.checkForInactivity);
chrome.tabs.onUpdated.addListener(TimeTracker.checkForInactivity);
chrome.runtime.onStartup.addListener(TimeTracker.sanitizeWeeklyData);
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

chrome.idle.setDetectionInterval(30);
chrome.idle.onStateChanged.addListener(function(state) {
  LocalStorageManager.getSingleKey("idle", function(idleBoolean) {
    if(idleBoolean === true && state == "active") {
      TimeTracker.handleInactivity();
    }
  });
});