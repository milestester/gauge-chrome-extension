function createNodeWithText(nodeType, text) {
  var newNode = document.createElement(nodeType);
  var textNode = document.createTextNode(text);
  newNode.appendChild(textNode);
  return newNode;
}

function buildOptionLabel(labelText) {
  var node = document.createElement("p");
  node.className = "storedsite";
  node.appendChild(createNodeWithText("span", labelText));
  node.appendChild(createNodeWithText("span", "delete"));
  document.getElementById("current-websites").appendChild(node);
  node.onmousedown = deleteItem(node);
}

function loadCurrentWebsites() {
  document.getElementById("websiteInput").focus();
  LocalStorageManager.getMultipleKeys(null, function(all) {
    for(var property in all) {
      if(all.hasOwnProperty(property) && property != "currentPageDomain" && property != "chromeHasFocus") {
        buildOptionLabel(property);
      }
    }
    setEventListeners();
  });
}

// TODO: validate entered URL
function setEventListeners() {
  document.getElementById("websiteInput").onkeypress = function(e){
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
    if (keyCode == '13'){
      var newURL = this.value;
      var domain = TimeTracker.getDomainFromHostName(newURL);
      var that = this;
      LocalStorageManager.getSingleKey(domain, function(siteObj) {
        if(siteObj == null) {
          // Site not currently being tracked
          var site = new Site(domain, undefined, {});
          site.saveToLocalStorage();
          buildOptionLabel(domain);
        }
        that.value = "";
      });
    }
  }
}

function deleteItem(node) {
  var domainText = node.innerText;
  return function(event) {
    LocalStorageManager.remove(domainText, function() {
      document.getElementById("current-websites").removeChild(node);
    });
  };
}

document.addEventListener('DOMContentLoaded', loadCurrentWebsites);