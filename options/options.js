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
  var changeColourSpan = createNodeWithText("span", "colour");
  var dividerSpan = createNodeWithText("span", "|");
  deleteSpan.className = "options delete";
  changeColourSpan.className = "options colour";
  dividerSpan.className = "options";

  node.appendChild(deleteSpan);
  node.appendChild(dividerSpan);
  node.appendChild(changeColourSpan);

  document.getElementById("current-websites").appendChild(node);

  setColourSpanEventListener(changeColourSpan, colour, labelText, node);
  deleteSpan.onmousedown = deleteItem(node);
}

function setColourSpanEventListener(changeColourSpan, colour, labelText, node) {
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

function loadCurrentWebsites() {
  document.getElementById('idle').addEventListener('click', saveIdleOption);
  document.getElementById("websiteInput").focus();
  LocalStorageManager.getMultipleKeys(null, function(all) {
    for(var property in all) {
      if(all.hasOwnProperty(property) && property != "currentPageDomain" && property != "chromeHasFocus") {
        if(property == "idle") {
          document.getElementById('idle').checked = all[property];
        } else {
          buildOptionLabel(property, all[property]["colour"]);
        }
      }
    }
    var colour = randomColour(0.7);
    document.getElementById("websiteInput").parentNode.style.backgroundColor = colour;
    document.getElementById("websiteInput").style.backgroundColor = colour;
    document.getElementById("websiteInput").style.borderColor = "#F22613";
    setEventListeners();
  });
}

function setEventListeners() {
  document.getElementById("websiteInput").onkeyup = function(e){
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
    var newURL = this.value;
    if(validURL(newURL)) {
      this.style.borderColor = "#87D37C";
      if (keyCode == '13'){
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
            that.style.borderColor = "#F22613";
            that.parentNode.style.backgroundColor = colour;
            that.style.backgroundColor = colour;
          });
      }
    } else {
      this.style.borderColor = "#F22613";
    }

  }
}

function validURL(newURL) {
  var result = /^([a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,6}$/.test(newURL);
  return result;
}

function randomColourFactor() {
  return Math.round(Math.random() * 255);
};

function randomColour(opacity) {
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

function saveIdleOption() {
  var checked = this.checked;
  LocalStorageManager.save("idle", checked);
}

document.addEventListener('DOMContentLoaded', loadCurrentWebsites);
