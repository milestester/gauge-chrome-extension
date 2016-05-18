// Saves options to chrome.storage.sync.
// function save_options() {
//   var color = document.getElementById('color').value;
//   var likesColor = document.getElementById('like').checked;
//   chrome.storage.sync.set({
//     favoriteColor: color,
//     likesColor: likesColor
//   }, function() {
//     // Update status to let user know options were saved.
//     var status = document.getElementById('status');
//     status.textContent = 'Options saved.';
//     setTimeout(function() {
//       status.textContent = '';
//     }, 750);
//   });
// }

// // Restores select box and checkbox state using the preferences
// // stored in chrome.storage.
// function restore_options() {
//   // Use default value color = 'red' and likesColor = true.
//   chrome.storage.sync.get({
//     favoriteColor: 'red',
//     likesColor: true
//   }, function(items) {
//     document.getElementById('color').value = items.favoriteColor;
//     document.getElementById('like').checked = items.likesColor;
//   });
// }

function loadCurrentWebsites() {
  document.getElementsByTagName("input")[0].focus();

  for(var i = 0; i < timeWasteArray.length; i++) {
    var node = document.createElement("p");
    node.className = "storedsite";
    var textnode = document.createTextNode(timeWasteArray[i]);
    node.appendChild(textnode);
    document.getElementById("current-websites").appendChild(node);
  }

  document.getElementsByTagName("input")[0].onkeypress = function(e){
    if (!e) e = window.event;
    var keyCode = e.keyCode || e.which;
    if (keyCode == '13'){
      var newURL = document.getElementsByTagName("input")[0].value;
      if(timeWasteArray.indexOf(newURL) == -1) {
        timeWasteArray.push(newURL);
        var node = document.createElement("p");
        node.className = "storedsite";
        var textnode = document.createTextNode(newURL);
        node.appendChild(textnode);
        document.getElementById("current-websites").appendChild(node);
        document.getElementsByTagName("input")[0].value = "";
        localStorage["timeWasteArray"] = JSON.stringify(timeWasteArray);
      }
    }
  }

  var itemsToDelete = document.getElementsByClassName("storedsite");
  for(var i = 0; i < itemsToDelete.length; i++) {
    var item = itemsToDelete[i].innerText;
    itemsToDelete[i].onmousedown = function(event) {
      console.log(item);
    }
  }
}

document.addEventListener('DOMContentLoaded', loadCurrentWebsites);
