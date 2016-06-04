document.addEventListener("DOMContentLoaded", function() {
  openOptionsPane();
  // Bug here when next day, and lastNavigatedTime is yesterday
  // When you click on popup, time set to large amount?
  LocalStorageManager.getSingleKey("chromeHasFocus", function(chromeHasFocus) {
    if(chromeHasFocus) {
      updateCurrentTabOnPopupClick();
    } else {
      LocalStorageManager.save("chromeHasFocus", true);
      TimeTracker.handleInactivity(updateCurrentTabOnPopupClick);
    }
  });

});

function openOptionsPane() {
  document.getElementsByTagName("img")[0].addEventListener("click", function(event) {
    if(chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
  });
}

function updateCurrentTabOnPopupClick() {
  var queryInfo = {active: true, currentWindow: true};
  TimeTracker.getDomainOfActiveTab(queryInfo, function(activeTabDomain){
    LocalStorageManager.getSingleKey(activeTabDomain, function(siteObj) {
      console.log(siteObj);
      if(siteObj != null) {
        siteObj = new Site(activeTabDomain, siteObj["lastNavigatedTime"], siteObj["datesTracked"], siteObj["colour"]);
        // Tab when extension button pressed is being tracked
        var now = new Date();
        var currentActiveTime = now.getTime();
        siteObj.updateActiveTimeToday(currentActiveTime);
        siteObj.updateLastNavigatedTime(currentActiveTime);
        siteObj.saveToLocalStorage(updatePopup);
      } else {
        updatePopup();
      }
    });
  });
}

function updatePopup() {
  LocalStorageManager.getMultipleKeys(null, function(all) {
    var dataArray = [];
    var labelArray = [];
    var dataColorArray = [];
    var now = new Date();
    for(var property in all) {
      if(all.hasOwnProperty(property) && property != "currentPageDomain" && property != "chromeHasFocus") {
        var currentSiteObj = all[property];
        var datesTracked = currentSiteObj["datesTracked"];
        if(datesTracked[now.toLocaleDateString()]) {
          dataArray.push(datesTracked[now.toLocaleDateString()]);
        } else {
          dataArray.push(100);
        }
        labelArray.push(property);
        dataColorArray.push(currentSiteObj["colour"]);
      }
    }
    buildGraph(dataArray, labelArray, dataColorArray);
  });
}

function buildGraph(dataArray, labelArray, dataColorArray) {
  var ctx = document.getElementById("myChart");
  var data = {
    labels: labelArray,
    datasets: [
      {
        data: dataArray,
        borderWidth: 3,
        backgroundColor: dataColorArray,
        hoverBackgroundColor: dataColorArray
      }]
  };
  var options = {
    responsive: true,
    defaultFontFamily: "Roboto",
    title: {
      display: true,
      text: "Time Spent Today",
      fontSize: 18,
      fontFamily: "Roboto",
      fontStyle: "normal",
      fontColor: "rgb(117,117,117)"
    },
    legend: {
      position: "bottom",
      fullWidth: true,
      labels: {
        fontSize: 14,
        fontFamily: "Roboto",
        fontStyle: "normal",
        fontColor: "rgb(117,117,117)"
      }
    },
    tooltips: {
      enabled: true,
      mode: "single",
      callbacks: {
        label: function(tooltipItems, data) {
            var fullTime = msToTime(data.datasets[0].data[tooltipItems.index]);
            var output = "";
            if(fullTime["hours"] > 0) {
              output += fullTime["hours"] + " hours, ";
            }
            if(fullTime["minutes"] >= 0) {
              output += fullTime["minutes"] + " minutes, "
            }
            if(fullTime["seconds"] >= 0) {
              output += fullTime["seconds"] + " seconds"
            }
            return output;
          }
      }
    }
  };
  var myChart = new Chart(ctx, {
    type: "doughnut",
    data: data,
    options: options
  });
}

function msToTime(duration) {
    var milliseconds = parseInt((duration%1000)/100);
    var seconds = parseInt((duration/1000)%60);
    var minutes = parseInt((duration/(1000*60))%60);
    var hours = parseInt((duration/(1000*60*60))%24);
    return {hours: hours, minutes: minutes, seconds: seconds, milliseconds: milliseconds};
}
