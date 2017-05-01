
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
  bindto: '#stock',
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
    }
  }
});

var weatherChart = c3.generate({
  bindto: '#weather',
  data: {
    columns: [
      ['data1', 30, 200, 100, 400, 150, 250],
      ['data2', 50, 20, 10, 40, 15, 25]
    ]
  }
});

//getStock('aapl')
function getStock(symbol) {
  stockChart.unload()
  var ttAPI = "http://ttdev.ty-po.com:2020/stock/" + symbol;
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
}
