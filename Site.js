/*
Example Site Object
{
  "domain": "facebook.com",
  "lastNavigatedTime": 100,
  "datesTracked": {"5/20/2016": 1234, "5/21/2016": 1234}
}

This class holds data relevant to time tracking for a given website

*/

var Site = function(domain, lastNavigatedTime, datesTracked) {
  this.domain = domain;
  this.lastNavigatedTime = lastNavigatedTime;
  this.datesTracked = datesTracked;
  this.addToday = function(todaysDate, timeToAdd) {
    if(!this.datesTracked.todaysDate) {
      this.datesTracked.todaysDate = 0;
    }
    this.datesTracked.todaysDate += timeToAdd;
  };
  this.removeDay = function(dateToRemove) {
    if(this.datesTracked.dateToRemove) {
      delete this.datesTracked.dateToRemove;
    }
  };
  this.getDateData = function(date) {
    return this.datesTracked.date;
  };
  this.getDomain = function() {
    return this.domain;
  };
  this.getLastNavigatedTime = function() {
    return this.lastNavigatedTime;
  };
  this.updateLastNavigatedTime = function(newTime) {
    this.lastNavigatedTime = newTime;
  };
  this.updateActiveTimeToday = function(currentActiveTime) {
    var now = new Date();
    if(!this.datesTracked[now.toLocaleDateString()]) {
      this.datesTracked[now.toLocaleDateString()] = 0;
    }
    this.datesTracked[now.toLocaleDateString()] += (currentActiveTime - this.lastNavigatedTime);
    // this.saveToLocalStorage();
  };
  this.saveToLocalStorage = function(callback) {
    var outerObj = {};
    var innerObj = {};
    innerObj["domain"] = this.domain;
    innerObj["lastNavigatedTime"] = this.lastNavigatedTime;
    innerObj["datesTracked"] = this.datesTracked;
    outerObj[this.domain] = innerObj;
    chrome.storage.sync.set(outerObj, callback);
  };
  this.removeFromLocalStorage = function(site, callback) {
    chrome.storage.sync.remove(site.getDomain(), callback);
  };
}