/*
Example Local Storage TimeTracker Object
{
  "currentPageDomain" : "facebook.com",
  "facebook.com": {"lastNavigatedTime": 111,
                   "domain" : "facebook.com"
                   "datesTracked": { "5/20/2016": 11,
                                     "5/22/2016": 13 }
                  }
}

This class links to local storage which holds data about current websites being tracked.
This is a singleton class, since only one object should ever be created
*/

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