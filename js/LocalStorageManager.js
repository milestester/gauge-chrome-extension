/*
  Interface between the extension and chrome sync local storage
*/

var LocalStorageManager = {

  save: function(key, data, callback) {
    var obj = {};
    obj[key] = data;
    chrome.storage.sync.set(obj, callback);
  },

  saveObj: function(obj, callback) {
    chrome.storage.sync.set(obj, callback);
  },

  remove: function(key, callback) {
    chrome.storage.sync.remove(key, callback);
  },

  getSingleKey: function(key, callback) {
    chrome.storage.sync.get(key, function(obj) {
      if(LocalStorageManager.objectEmpty(obj)) {
        callback(null);
      } else {
        callback(obj[key]);
      }
    });
  },

  getMultipleKeys: function(keyArray, callback) {
    chrome.storage.sync.get(keyArray, function(obj) {
      if(LocalStorageManager.objectEmpty(obj)) {
        callback(null);
      } else {
        callback(obj);
      }
    });
  },

  objectEmpty: function(obj) {
    return (Object.keys(obj).length === 0 && obj.constructor === Object);
  }

};