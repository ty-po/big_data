var express = require('express')
var app = express()
var idb = require('./idb')


app.get('/', function (req, res) {
  idb.get("raw", false, (data) => {
    res.send(data)
  })
})

app.get('/:measure/', function (req, res) {
  idb.get(req.params.measure, false, (data) => {
    res.send(data)
  })
})

app.get('/:measure/:source', function (req, res) {
  idb.get(req.params.measure, req.params.source, (data) => {
    res.send(data)
  })
})

app.listen(2020, function () {
  console.log('Influx API on port 2020')
})





