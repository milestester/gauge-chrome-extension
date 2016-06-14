/*
Example Local Storage  Object
{
  "currentPageDomain" : "facebook.com",
  "chromeHasFocus"    : false
  "facebook.com"      : {
                           "lastNavigatedTime": 111,
                           "domain" : "facebook.com"
                           "datesTracked": {
                                            "5/20/2016": 11,
                                            "5/22/2016": 13
                                            }
                        }
}
This class links to local storage which holds data about current websites being tracked.
Instead of creating an object(class) to be instantiated, since we will never
need an instance of LocalStorageManager, I just grouped together functions
inside an object literal.
*/

var TimeTracker = {

  getDomainFromHostName: function(hostName) {
    var splitHostName = hostName.split("www.")
    if(splitHostName.length == 1) {
      return splitHostName[0];
    } else if(splitHostName.length == 2) {
      return splitHostName[1];
    }
  },

  getDomainOfActiveTab: function(queryInfo, callback) {
    chrome.tabs.query(queryInfo, function(tabs) {
      if(tabs.length > 0) {
        var url = new URL(tabs[0].url);
        var hostName = url.hostname;
        var domain = TimeTracker.getDomainFromHostName(hostName);
        callback(domain);
      }
    });
  },

  handleActiveTab: function() {
    var queryInfo = {active: true, currentWindow: true};
    TimeTracker.getDomainOfActiveTab(queryInfo, function(activeTabDomain) {
      TimeTracker.getCurrentPageDomain(activeTabDomain);
    });
  },

  getCurrentPageDomain: function(activeTabDomain) {
    LocalStorageManager.getSingleKey("currentPageDomain", function(previousPageDomain) {
      if(previousPageDomain && (activeTabDomain != previousPageDomain)) {
        TimeTracker.checkActiveTabForTrackedSite(activeTabDomain, previousPageDomain);
      }
      LocalStorageManager.save("currentPageDomain", activeTabDomain);
    });
  },

  checkActiveTabForTrackedSite: function(activeTabDomain, previousPageDomain) {
    LocalStorageManager.getMultipleKeys([activeTabDomain, previousPageDomain], function(items) {
      var now = new Date();
      var currentActiveTime = now.getTime();
      // Does this fully work now?
      if(items != null) {
        siteObj = items[activeTabDomain];
        prevSiteObj = items[previousPageDomain];
        if(siteObj) {
          siteObj = new Site(activeTabDomain, siteObj["lastNavigatedTime"], siteObj["datesTracked"], siteObj["colour"]);
          // Current active tab is being tracked
          siteObj.updateLastNavigatedTime(currentActiveTime);
          siteObj.saveToLocalStorage();
        }
        // If previous page also tracked, we need to update it
        // Doesn't matter if this gets run before saveToLocalStorage finishes
        // Since it is working on two different local storage options
        if(prevSiteObj) {
          TimeTracker.updatePreviousPageDomain(previousPageDomain, currentActiveTime);
        }
      } else {
        // Current active tab not being tracked
        TimeTracker.updatePreviousPageDomain(previousPageDomain, currentActiveTime);
      }
    });
  },

  updatePreviousPageDomain: function(previousPageDomain, currentActiveTime) {
    LocalStorageManager.getSingleKey(previousPageDomain, function(prevTabSiteObj) {
      if(prevTabSiteObj != null) {
        prevTabSiteObj = new Site(previousPageDomain, prevTabSiteObj["lastNavigatedTime"], prevTabSiteObj["datesTracked"], prevTabSiteObj["colour"]);
        // Previous tab was being tracked, so update its active time for today
        prevTabSiteObj.updateActiveTimeToday(currentActiveTime);
        prevTabSiteObj.saveToLocalStorage();
      }
    });
  },

  sanitizeWeeklyData: function() {
    LocalStorageManager.getMultipleKeys(null, function(allObj) {
      for(var property in allObj) {
        if(allObj.hasOwnProperty(property) && property != "currentPageDomain" && property != "chromeHasFocus" && property != "idle") {
          var currentSite = allObj[property];
          var s = new Site(property, currentSite["lastNavigatedTime"], currentSite["datesTracked"], currentSite["colour"]);
          var now = new Date();
          now.setDate(now.getDate()-8);
          s.removeDay(now.toLocaleDateString());
          s.saveToLocalStorage();
        }
      }
    });
  },

  handleInactivity : function(callback) {
    LocalStorageManager.getSingleKey("currentPageDomain", function(previousPageDomain) {
      if(previousPageDomain) {
        var now = new Date();
        var currentActiveTime = now.getTime();
        TimeTracker.updatePreviousPageLastNavigatedTime(previousPageDomain, currentActiveTime, callback);
      }
    });
  },

  updatePreviousPageLastNavigatedTime: function(previousPageDomain, currentActiveTime, callback) {
    LocalStorageManager.getSingleKey(previousPageDomain, function(prevTabSiteObj) {
      if(prevTabSiteObj != null) {
        prevTabSiteObj = new Site(previousPageDomain, prevTabSiteObj["lastNavigatedTime"], prevTabSiteObj["datesTracked"], prevTabSiteObj["colour"]);
        prevTabSiteObj.updateLastNavigatedTime(currentActiveTime);
        prevTabSiteObj.saveToLocalStorage(callback);
      }
    });
  },

  // Hack to get around chrome api bug where focus change does not fire
  // again when chrome comes into focus from external window
  checkForInactivity : function() {
    LocalStorageManager.getSingleKey("chromeHasFocus", function(chromeHasFocus) {
      if(chromeHasFocus) {
        TimeTracker.handleActiveTab();
      } else {
        LocalStorageManager.save("chromeHasFocus", true);
        TimeTracker.handleInactivity(TimeTracker.handleActiveTab);
      }
    });
  }

}
