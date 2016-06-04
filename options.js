function createNodeWithText(nodeType, text) {
  var newNode = document.createElement(nodeType);
  var textNode = document.createTextNode(text);
  newNode.appendChild(textNode);
  return newNode;
}

function buildOptionLabel(labelText, colour) {
  var node = document.createElement("p");
  node.className = "storedsite";
  node.style.backgroundColor = colour;
  node.appendChild(createNodeWithText("span", labelText));
  var deleteSpan = createNodeWithText("span", "delete");
  var idleSpan = createNodeWithText("span", "idle");
  var changeColourSpan = createNodeWithText("span", "colour");
  var dividerSpan = createNodeWithText("span", "|");
  var dividerSpan2 = createNodeWithText("span", "|");
  deleteSpan.className = "options delete";
  idleSpan.className = "options";
  changeColourSpan.className = "options";
  dividerSpan.className = "options";
  dividerSpan2.className = "options";

  node.appendChild(deleteSpan);
  node.appendChild(dividerSpan);
  node.appendChild(changeColourSpan);
  node.appendChild(dividerSpan2);
  node.appendChild(idleSpan);

  document.getElementById("current-websites").appendChild(node);

  setColourSpanEventListener(changeColourSpan, colour, labelText);
  setDeleteSpanEventListener(deleteSpan, node, colour);
}

function setColourSpanEventListener(changeColourSpan) {
  changeColourSpan.onmousedown = function(e) {
    LocalStorageManager.getSingleKey(labelText, function(siteObj) {
      if(siteObj != null) {
        var colour = randomColour(0.7);
        var site = new Site(labelText, siteObj["lastNavigatedTime"], siteObj["datesTracked"], colour);
        site.saveToLocalStorage();
        node.style.backgroundColor = colour;
      }
    });
  };
}

function setDeleteSpanEventListener(deleteSpan, node, colour) {
  deleteSpan.onmousedown = deleteItem(node);
  deleteSpan.onmouseover = function(e) {
    node.style.backgroundColor = "#e74c3c";
  };
  deleteSpan.onmouseout = function(e) {
    node.style.backgroundColor = colour;
  };
}

function loadCurrentWebsites() {
  document.getElementById("websiteInput").focus();
  LocalStorageManager.getMultipleKeys(null, function(all) {
    for(var property in all) {
      if(all.hasOwnProperty(property) && property != "currentPageDomain" && property != "chromeHasFocus") {
        buildOptionLabel(property, all[property]["colour"]);
      }
    }
    var colour = randomColour(0.7);
    document.getElementById("websiteInput").parentNode.style.backgroundColor = colour;
    document.getElementById("websiteInput").style.backgroundColor = colour;
    document.getElementById("websiteInput").style.borderColor = "#fff";
    setEventListeners();
  });
}

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
          var colour = document.getElementById("websiteInput").parentNode.style.backgroundColor;
          var site = new Site(domain, undefined, {}, colour);
          site.saveToLocalStorage();
          buildOptionLabel(domain, colour);
        }
        that.value = "";
        var colour = randomColour(0.7);
        document.getElementById("websiteInput").parentNode.style.backgroundColor = colour;
        document.getElementById("websiteInput").style.backgroundColor = colour;
      });
    }
  }
}

// Bug, sometimes chart not showing up because of random colour?
var randomColourFactor = function() {
  return Math.round(Math.random() * 255);
};

var randomColour = function(opacity) {
  return 'rgba(' + randomColourFactor() + ',' + randomColourFactor() + ',' + randomColourFactor() + ',' + (opacity || '.3') + ')';
};

function deleteItem(node) {
  var domainText = node.innerText;
  return function(event) {
    LocalStorageManager.remove(domainText, function() {
      document.getElementById("current-websites").removeChild(node);
    });
  };
}

document.addEventListener('DOMContentLoaded', loadCurrentWebsites);
