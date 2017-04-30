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
    else start_date = new Date(latest[0].time.valueOf() + 86400000)

    console.log(start_date)
    //Check if start date == current date and skip
    if (start_date > Date.now()) {
      idb.get('stock', req.params.symbol, (rows) => {
        res.send(rows)        
      })
    }
    else {
      request("http://dev.markitondemand.com/MODApis/Api/v2/InteractiveChart/json?parameters=" + 
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
        }),
      (err, rres, body) => {
        if (err) res.send(err)
        else if (body.includes('html')) res.send("Markit Error")
        else{
          data = JSON.parse(body)
          //Store
          quotes = data.Elements[0].DataSeries
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
