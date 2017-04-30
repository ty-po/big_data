var express = require('express')
var app = express()
var idb = require('./idb')
var stocks = require('./quotes')

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', function (req, res) {
  res.send("// W - W - W Api")
})

app.use('/stock', stocks)

app.get('/data/:measure/', function (req, res) {
  idb.get(req.params.measure, false, (data) => {
    res.send(data)
  })
})

app.get('/data/:measure/:source', function (req, res) {
  idb.get(req.params.measure, req.params.source, (data) => {
    res.send(data)
  })
})

app.listen(2020, function () {
  console.log('Influx API on port 2020')
})





