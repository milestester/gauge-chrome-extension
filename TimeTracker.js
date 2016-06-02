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

var TimeTrackerUpdated = {

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
        var domain = TimeTrackerUpdated.getDomainFromHostName(hostName);
        callback(domain);
      }
    });
  },

  handleActiveTab: function() {
    var queryInfo = {active: true, currentWindow: true};
    TimeTrackerUpdated.getDomainOfActiveTab(queryInfo, function(activeTabDomain) {
      TimeTrackerUpdated.getCurrentPageDomain(activeTabDomain);
    });
  },

  getCurrentPageDomain: function(activeTabDomain) {
    LocalStorageManager.getSingleKey("currentPageDomain", function(previousPageDomain) {
      if(previousPageDomain && (activeTabDomain != previousPageDomain)) {
        TimeTrackerUpdated.checkActiveTabForTrackedSite(activeTabDomain, previousPageDomain);
      }
      LocalStorageManager.save("currentPageDomain", activeTabDomain);
    });
  },

  checkActiveTabForTrackedSite: function(activeTabDomain, previousPageDomain) {
    LocalStorageManager.getSingleKey(activeTabDomain, function(siteObj) {
      var now = new Date();
      var currentActiveTime = now.getTime();
      if(siteObj != null) {
        siteObj = new Site(activeTabDomain, siteObj["lastNavigatedTime"], siteObj["datesTracked"]);
        // Current active tab is being tracked
        siteObj.updateLastNavigatedTime(currentActiveTime);
        siteObj.saveToLocalStorage();
      } else {
        // Current active tab not being tracked
        TimeTrackerUpdated.updatePreviousPageDomain(previousPageDomain, currentActiveTime);
      }
    });
  },

  updatePreviousPageDomain: function(previousPageDomain, currentActiveTime) {
    LocalStorageManager.getSingleKey(previousPageDomain, function(prevTabSiteObj) {
      if(prevTabSiteObj != null) {
        prevTabSiteObj = new Site(previousPageDomain, prevTabSiteObj["lastNavigatedTime"], prevTabSiteObj["datesTracked"]);
        // Previous tab was being tracked, so update its active time for today
        prevTabSiteObj.updateActiveTimeToday(currentActiveTime);
        prevTabSiteObj.saveToLocalStorage();
      }
    });
  },

  sanitizeWeeklyData: function() {
    LocalStorageManager.getMultipleKeys(null, function(allObj) {
      for(var property in allObj) {
        if(allObj.hasOwnProperty(property) && property != "currentPageDomain" && property != "chromeHasFocus") {
          var currentSite = allObj[property];
          var s = new Site(property, currentSite["lastNavigatedTime"], currentSite["datesTracked"]);
          var datesTracked = currentSite["datesTracked"];
          var now = new Date();
          now.setDate(now.getDate()-8);
          s.removeDay(now.toLocaleDateString());
          s.saveToLocalStorage();
        }
      }
    });
  }

}


var TimeTracker = (function() {
  var _instance = null;

  function TimeTracker() {
    this.addSite = function(newSiteDomain) {
      var site = new Site(newSiteDomain, undefined, {});
      site.saveToLocalStorage();
    };
    this.removeSite = function(siteToRemove) {
      siteToRemove.removeFromLocalStorage();
    };
    this.getCurrentPageDomain = function(callback) {
      this.getFromLocalStorage("currentPageDomain", function(domain) {
        callback(domain);
      });
    };
    this.getTrackedSite = function(siteDomain, callback) {
      this.getFromLocalStorage(siteDomain, function(siteObj) {
        if(siteObj == null) {
          callback(null)
        } else {
          callback(new Site(siteDomain, siteObj["lastNavigatedTime"], siteObj["datesTracked"]));
        }
      });
    };
    this.setCurrentPageDomain = function(activeTabDomain) {
      this.saveToLocalStorage("currentPageDomain", activeTabDomain);
    };
    this.getFromLocalStorage = function(key, callback) {
      chrome.storage.sync.get(key, function(obj) {
        if(objectEmpty(obj)) {
          callback(null);
        } else {
          callback(obj[key]);
        }
      });
    };
    this.getAllFromLocalStorage = function(callback) {
      chrome.storage.sync.get(null, function(obj) {
        if(objectEmpty(obj)) {
          callback(null);
        } else {
          callback(obj);
        }
      });
    };
    this.saveToLocalStorage = function(key, toSave, callback) {
      var obj = {};
      obj[key] = toSave;
      chrome.storage.sync.set(obj, callback);
    };
    this.removeFromLocalStorage = function(domain, callback) {
      chrome.storage.sync.remove(domain, callback);
    };
  }

  return {
    getInstance: function() {
      if (!_instance) {
        _instance = new TimeTracker();
        _instance.__proto__.constructor = function(){}; // hide constructor
      }
      return _instance;
    }
  };
})();