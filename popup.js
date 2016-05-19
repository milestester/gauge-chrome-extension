document.addEventListener("DOMContentLoaded", function() {

  document.getElementsByTagName("img")[0].addEventListener("click", function(event) {
    if(chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      window.open(chrome.runtime.getURL('options.html'));
    }
  });

  var queryInfo = {active: true, currentWindow: true};
  chrome.tabs.query(queryInfo, function(tabs) {
    if(tabs.length > 0) {
      var url = new URL(tabs[0].url);
      var hostName = url.hostname;
      if(timeWasteArray.indexOf(hostName) != -1) {
        var previousPage = localStorage["currentPage"];
        if(timeWasteArray.indexOf(previousPage) != -1) {
          var obj = localStorage[previousPage];
          if(obj) {
            var now = new Date();
            var currentActiveTime = now.getTime();
            obj = JSON.parse(obj);
            obj[now.toLocaleDateString()] += (currentActiveTime - obj["lastNavigatedTime"]);
            obj["lastNavigatedTime"] = currentActiveTime;
            localStorage[previousPage] = JSON.stringify(obj);
          }
        }
      }
      updatePopup();
    }
  });
});

function updatePopup() {
  var dataArray = [];
  var labelArray = [];
  var dataColorArray = [];
  var now = new Date();
  for(var i = 0; i < timeWasteArray.length; i++) {
    if(!localStorage[timeWasteArray[i]]) continue;
    var obj = JSON.parse(localStorage[timeWasteArray[i]]);
    if(obj[now.toLocaleDateString()]) {
      labelArray.push(timeWasteArray[i]);
      dataArray.push(obj[now.toLocaleDateString()]);
      dataColorArray.push(randomColor(1));
    }
  }
  if(dataArray.length == 0) {
    document.getElementById("myChart").style.display = "none";
    document.getElementsByTagName("h1")[0].style.display = "block";
  } else {
    document.getElementsByTagName("h1")[0].style.display = "none";
    buildGraph(dataArray, labelArray, dataColorArray);
  }
}

function buildGraph(dataArray, labelArray, dataColorArray) {
  var ctx = document.getElementById("myChart");
  var data = {
    labels: labelArray,
    datasets: [
      {
        data: dataArray,
        borderWidth: 3,
        // backgroundColor: [
        //   "#FF6384",
        //   "#36A2EB",
        //   "#FFCE56"
        // ],
        backgroundColor: dataColorArray,
        // hoverBackgroundColor: [
        //   "#FF6384",
        //   "#36A2EB",
        //   "#FFCE56"
        // ]
        hoverBackgroundColor: dataColorArray
      }]
  };
  var options = {
    responsive: true,
    title: {
      display: true,
      text: "Time Spent Today",
      fontSize: 18,
      fontFamily: "Helvetica Neue",
      fontStyle: "normal"
    },
    legend: {
      position: "bottom",
      fullWidth: true,
      labels: {
        fontSize: 14,
        fontFamily: "Helvetica Neue",
        fontStyle: "normal"
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

var randomColorFactor = function() {
  return Math.round(Math.random() * 255);
};
var randomColor = function(opacity) {
  return 'rgba(' + randomColorFactor() + ',' + randomColorFactor() + ',' + randomColorFactor() + ',' + (opacity || '.3') + ')';
};
