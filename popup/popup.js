var myChart;
var chartBoolean = false;

document.addEventListener("DOMContentLoaded", function() {
  openOptions();
  // Bug here when next day, and lastNavigatedTime is yesterday
  // When you click on popup, time set to large amount?
  LocalStorageManager.getSingleKey("chromeHasFocus", function(chromeHasFocus) {
    if(!chromeHasFocus) {
      LocalStorageManager.save("chromeHasFocus", true);
      TimeTracker.handleInactivity();
    }
    updateCurrentTabOnPopupClick();
  });
});

function openOptions() {
  document.getElementsByTagName("img")[0].addEventListener("click", function(event) {
    if(chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('/options/options.html'));
    }
  });
  document.getElementsByTagName("img")[1].addEventListener("click", function(event) {
    if(chartBoolean == false) {
      chartBoolean = true;
      updatePopup("weekly");
    } else {
      chartBoolean = false;
      updatePopup();
    }
  });
}

function updateCurrentTabOnPopupClick() {
  var queryInfo = {active: true, currentWindow: true};
  TimeTracker.getDomainOfActiveTab(queryInfo, function(activeTabDomain){
    LocalStorageManager.getSingleKey(activeTabDomain, function(siteObj) {
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

function updatePopup(graphType) {
  LocalStorageManager.getMultipleKeys(null, function(all) {
    var dataArray = [];
    var weeklyData = [];
    var labelArray = [];
    var dataColorArray = [];
    var now = new Date();
    for(var property in all) {
      if(all.hasOwnProperty(property) && property != "currentPageDomain" && property != "chromeHasFocus" && property != "idle") {
        var currentSiteObj = all[property];
        var datesTracked = currentSiteObj["datesTracked"];
        weeklyData.push(datesTracked);
        if(datesTracked[now.toLocaleDateString()]) {
          dataArray.push(datesTracked[now.toLocaleDateString()]);
        } else {
          dataArray.push(100);
        }
        labelArray.push(property);
        dataColorArray.push(currentSiteObj["colour"]);
      }
    }
    if(dataArray.length == 0) {
      dataArray.push(100);
      labelArray.push("No Tracked Websites");
    }
    if(graphType == "weekly") {
      var dataSets = [];
      var weeklyLabels = [];
      var weekTempData = [];
      for(var i = 0; i < weeklyData.length; i++) {
        var obj = {};
        var dataTemp = [];
        obj["label"] = labelArray[i];
        obj["backgroundColor"] = dataColorArray[i];
        var sortable = [];
        for(var date in weeklyData[i]) {
          sortable.push([date, weeklyData[i][date]]);
        }
        sortable.sort(function(a, b) {return new Date(a[0]).getTime() - new Date(b[0]).getTime()});
        for(var j = 0; j < sortable.length; j++) {
          var current = sortable[j];
          if(weeklyLabels.length < 7) weeklyLabels.push(current[0]);
          weekTempData.push(current[1]);
        }
        while(weekTempData.length < 7) {
          weekTempData.unshift(0);
        }
        obj["data"] = weekTempData;
        weekTempData = [];
        dataSets.push(obj);
      }
      buildWeeklyGraph(dataSets, weeklyLabels);
    } else {
      buildGraph(dataArray, labelArray, dataColorArray);
    }
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
      fontColor: "rgb(117,117,117)",
      padding: 15
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
  if(myChart) {
    myChart.destroy();
  }
  myChart = new Chart(ctx, {
    type: "doughnut",
    data: data,
    options: options
  });
}

function buildWeeklyGraph(dataSets, labelArray) {
  var ctx = document.getElementById("myChart");
  var data = {
    labels: labelArray,
    datasets: dataSets
  };
  var options = {
    responsive: true,
    maintainAspectRatio: false,
    defaultFontFamily: "Roboto",
    title: {
      display: true,
      text: "Time Spent This Week",
      fontSize: 18,
      fontFamily: "Roboto",
      fontStyle: "normal",
      fontColor: "rgb(117,117,117)",
      padding: 15
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
    scales: {
        xAxes: [{
            stacked: true
        }],
        yAxes: [{
            stacked: true,
            display: false,
        }]
    },
    tooltips: {
    enabled: true,
    mode: "single",
    callbacks: {
      label: function(tooltipItems, data) {
        var fullTime = msToTime(data.datasets[tooltipItems.datasetIndex].data[tooltipItems.index]);
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
  myChart.destroy();
  myChart = new Chart(ctx, {
    type: "bar",
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
