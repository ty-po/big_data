const stock_api = "http://ttdev.ty-po.com:2020"
const data_api = "http://ttdev.ty-po.com:4040"

function pluck(arr, key) { 
  return arr.map((e) => { return e[key]; }) 
}

function downsample(arr, target) {
  res = []
  arr.forEach((e, i) => {
    if (!(i % Math.floor(arr.length/target))) res.push(e)
  })
  return res
}

$("#go").click(() => {
  submit()
})

$("#search").keydown((e) => {
  if (e.keyCode == 13) {
    submit()
  }
})

function submit() {
  symbol = $("#search").val()
  $("#search").val("")
  $("#stock-title").text("")
  $("#status").text("Fetching $" + symbol.toUpperCase())
  getStock(symbol.toLowerCase())
}


var stockChart = c3.generate({
  bindto: '#stock-chart',
  data: {
    columns: [],
    x: 'time',
    xFormat: '%Y-%m-%dT%H:%M:%S.%LZ',
  },
  axis: {
    x: {
      type: 'timeseries',
      tick: { format: '%m/%d/%Y' }
    }
  },
  subchart: {
    show: true,
    onbrush: function(d) {
      weatherChart.zoom(d)
      conflictChart.zoom(d)
      marriageChart.zoom(d)
      indexChart.zoom(d)
    }
  }
});

var indexChart = c3.generate({
  bindto: '#index-chart',
  data: {
    columns: [],
    x: 'time',
    xFormat: '%Y-%m-%dT%H:%M:%S.%LZ',
  },
  axis: {
    x: {
      type: 'timeseries',
      tick: { format: '%m/%d/%Y' }
    }
  },
});

var weatherChart = c3.generate({
  bindto: '#weather-chart',
  data: {
    url: data_api + '/raw/weather.csv',
    x: 'Date',
    xFormat: '%m/%d/%Y',
  },
  axis: {
    x: {
      type: 'timeseries',
      tick: { format: '%m/%d/%Y' }
    }
  }
});

var conflictChart = c3.generate({
  bindto: '#conflict-chart',
  data: {
    url: data_api + '/raw/conflict.csv',
    x: 'INFORM Year',
    xFormat: '%Y',
  },
  axis: {
    x: {
      type: 'timeseries',
      tick: { format: '%m/%d/%Y' }
    }
  },
});

var marriageChart = c3.generate({
  bindto: '#marriage-chart',
  data: {
    url: data_api + '/raw/marriage.csv',
    x: 'Year',
    xFormat: '%m/%Y',
  },
  axis: {
    x: {
      type: 'timeseries',
      tick: { format: '%m/%d/%Y' }
    }
  },
});


function getStock(symbol) {
  stockChart.unload()
  var ttAPI = stock_api + "/stock/" + symbol;
  var indexAPI = data_api + "/index/" + symbol
  $.getJSON(ttAPI)
    .done((data) => {
      if(data.includes("Error")) {
        $("#status").text("Stock not found")
        return;
      }

      data = downsample(data, 200)

      setTimeout(() => {
        stockChart.load({
          x: 'time',
          xFormat: '%Y-%m-%dT%H:%M:%S.%LZ',
          json: data,
          keys: {
            x: 'time',
            value: ['high', 'low'],
          },  
        })
        $("#stock-title").text(symbol.toUpperCase())
        $("#status").text("")
      }, 1000)
    })
    .fail(function() {
      console.log('err')
      $("#status").text("Stock not found")
    })
  $.getJSON(indexAPI)
    .done((data) => {
      if(data.includes("Error")) {
        return;
      }
      setTimeout(() => {
        indexChart.load({
          x: 'time',
          xFormat: '%Y-%m-%dT%H:%M:%S.%LZ',
          json: data,
          keys: {
            x: 'time',
            value: ['index', 'stock'],
          },  
        })
      }, 1000)
    })
    .fail(function() {
      console.log('err')
    })
}
