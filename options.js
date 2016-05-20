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
  for(var i = 0; i < timeWasteArray.length; i++) {
    buildOptionLabel(timeWasteArray[i]);
  }
  setEventListeners();
}

function setEventListeners() {
  document.getElementById("websiteInput").onkeypress = function(e){
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
    if (keyCode == '13'){
      var newURL = this.value;
      if(timeWasteArray.indexOf(newURL) == -1) {
        timeWasteArray.push(newURL);
        buildOptionLabel(newURL);
        this.value = "";
        localStorage["timeWasteArray"] = JSON.stringify(timeWasteArray);
      }
    }
  }
}

function deleteItem(node) {
  return function(event) {
    var index = timeWasteArray.indexOf(node.innerText);
    timeWasteArray.splice(index, 1);
    localStorage["timeWasteArray"] = JSON.stringify(timeWasteArray);
    localStorage.removeItem(node.firstChild.innerText);
    document.getElementById("current-websites").removeChild(node);
  };
}
document.addEventListener('DOMContentLoaded', loadCurrentWebsites);