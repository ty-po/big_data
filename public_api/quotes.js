var idb = require('./idb')
var request = require('request')
var express = require('express')
var stocks = express.Router()

stocks.get('/', function (req, res) {
  res.send("][")
})

stocks.get('/:symbol', function (req, res) {
  //Get from influx
  idb.getLatest("stock", req.params.symbol, (latest) => {
    console.log(latest)
    if (latest.length == 0) start_date = new Date('01/01/2012')
    else start_date = new Date(latest[0].time.valueOf())

    console.log(start_date)

    last_business_day = Date.now()
    weekday = new Date().getDay()
    if (weekday == 6) last_business_day -= (86400000)
    if (weekday == 0) last_business_day -= (86400000) * 2
    if (weekday == 1) last_business_day -= (86400000) * 3

    last_business_day = new Date(last_business_day)
    last_business_day.setHours(0,0,0,0) 

    console.log(last_business_day)

    if (start_date >= last_business_day) {
      console.log("skipping")
      idb.get('stock', req.params.symbol, (rows) => {
        res.send(rows)
      })
    }
    else {
      markit_url = "http://dev.markitondemand.com/MODApis/Api/v2/InteractiveChart/json?parameters=" + 
        JSON.stringify({
          Normalized: false,
          StartDate: start_date.toISOString().split('T')[0] + 'T00:00:00-00',
          EndDate: new Date().toISOString().split('T')[0] + 'T00:00:00-00',
          DataPeriod: 'Day',
          LabelPeriod: 'Year',
          Elements: [{
            Symbol: req.params.symbol,
            Type: 'price',
            Params: ["ohlc"]
          }]
        })
      //console.log(markit_url)
      request(markit_url, (err, rres, body) => {
        if (err) res.send(err)
        else if (body.includes('html')) res.send("Markit Error")
        else{
          data = JSON.parse(body)
          //Store
          quotes = data.Elements[0].DataSeries
          console.log("Pushing " + data.Dates.length + " Points to " + req.params.symbol)
          //console.log(data.Dates)
          idb.pushStock(data.Dates, req.params.symbol, quotes.open.values, quotes.high.values, quotes.low.values, quotes.close.values, () => {
            idb.get('stock', req.params.symbol, (rows) => {
              res.send(rows)        
            })
          })
        } 
      })
    }
  })
})

module.exports = stocks
