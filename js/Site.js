/*
Example Site Object
{
  "domain": "facebook.com",
  "lastNavigatedTime": 100,
  "datesTracked": {"5/20/2016": 1234, "5/21/2016": 1234},
  "color": "#fff"
}

This class holds data relevant to time tracking for a given website

*/

var Site = function(domain, lastNavigatedTime, datesTracked, chartColour) {
  this.domain = domain;
  this.lastNavigatedTime = lastNavigatedTime;
  this.datesTracked = datesTracked;
  this.colour = chartColour;
}

Site.prototype.setColour = function(newColour) {
  this.colour = newColour;
};

Site.prototype.getColour = function() {
  return this.colour;
};

Site.prototype.addToday = function(todaysDate, timeToAdd) {
  if(!this.datesTracked.todaysDate) {
    this.datesTracked.todaysDate = 0;
  }
  this.datesTracked.todaysDate += timeToAdd;
};

Site.prototype.removeDay = function(dateToRemove) {
  if(this.datesTracked[dateToRemove]) {
    delete this.datesTracked[dateToRemove];
  }
};

Site.prototype.getDateData = function(date) {
  return this.datesTracked.date;
};

Site.prototype.getDomain = function() {
  return this.domain;
};

Site.prototype.getLastNavigatedTime = function() {
  return this.lastNavigatedTime;
};

Site.prototype.updateLastNavigatedTime = function(newTime) {
  this.lastNavigatedTime = newTime;
};

Site.prototype.updateActiveTimeToday = function(currentActiveTime) {
  var now = new Date();
  if(!this.datesTracked[now.toLocaleDateString()]) {
    this.datesTracked[now.toLocaleDateString()] = 0;
  }
  this.datesTracked[now.toLocaleDateString()] += (currentActiveTime - this.lastNavigatedTime);
};

Site.prototype.saveToLocalStorage = function(callback) {
  var outerObj = {};
  var innerObj = {};
  innerObj["domain"] = this.domain;
  innerObj["lastNavigatedTime"] = this.lastNavigatedTime;
  innerObj["datesTracked"] = this.datesTracked;
  innerObj["colour"] = this.colour;
  outerObj[this.domain] = innerObj;
  LocalStorageManager.saveObj(outerObj, callback);
};

Site.prototype.removeFromLocalStorage = function(site, callback) {
  LocalStorageManager.remove(site.getDomain(), callback);
};