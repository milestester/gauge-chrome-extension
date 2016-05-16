document.addEventListener('DOMContentLoaded', function() {
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
      update();
    }
  });
});

function update() {
  var dataArray = [];
  var labelArray = [];

  var now = new Date();
  var output = "<h1> Today you've wasted: </h1> <ul>";
  for(var i = 0; i < timeWasteArray.length; i++) {
    if(!localStorage[timeWasteArray[i]]) continue;
    var obj = JSON.parse(localStorage[timeWasteArray[i]]);
    if(obj[now.toLocaleDateString()]) {
      var temp = msToTime(obj[now.toLocaleDateString()]);
      output += "<li>" + temp["hours"] + " hours, "
                       + temp["minutes"] + " minutes, "
                       + temp["seconds"] + " seconds, "
                       + "on " + timeWasteArray[i];
                "</li>";
      labelArray.push(timeWasteArray[i]);
      dataArray.push(obj[now.toLocaleDateString()]);
    }
  }
  output += "</ul>";
  document.getElementById('status').innerHTML = output;



  var ctx = document.getElementById("myChart");
  var data = {
    labels: labelArray,
    datasets: [
        {
            data: dataArray,
            backgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCE56"
            ],
            hoverBackgroundColor: [
                "#FF6384",
                "#36A2EB",
                "#FFCE56"
            ]
        }]

  };
  var myChart = new Chart(ctx, {
      type: 'doughnut',
      data: data
  });
}

function msToTime(duration) {
    var milliseconds = parseInt((duration%1000)/100);
    var seconds = parseInt((duration/1000)%60);
    var minutes = parseInt((duration/(1000*60))%60);
    var hours = parseInt((duration/(1000*60*60))%24);
    return {hours: hours, minutes: minutes, seconds: seconds, milliseconds: milliseconds};
}
