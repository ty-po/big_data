const uuid    = require('uuid/v4')
const Influx  = require('influx');
const influx  = new Influx.InfluxDB({
  host: 'influx',
  database: 'tt',
  schema: [
    {
      measurement: 'stock',
      fields: {
        open: Influx.FieldType.FLOAT,
        high: Influx.FieldType.FLOAT,
        low: Influx.FieldType.FLOAT,
        close: Influx.FieldType.FLOAT
      },
      tags: [
        'source',
        'item_id'
      ]
    }
  ]
})

function sanitize(query) {
  return query.replace(';', "NULL")
}

module.exports = {
  pushStock: function(date, symbol, open, high, low, close, cb) {
    //influx.createDatabase('tt')
    //console.log(date)
    //console.log(symbol)

    data = date.map((e, i) => {
      return {
        measurement: 'stock',
        tags: { source: symbol, item_id: uuid() },
        fields: { open: open[i], high: high[i], low: low[i], close: close[i] },
        timestamp: new Date(e),
      }
    })
    influx.writePoints(
      data
      ,{
      precision: 'ms'
    }).then(() => { cb() })
      .catch((err) => { console.log("Influx Write Error: " + err) })
  },
  get: function(measurement, source, cb) {
    var query = sanitize('select * from ' + measurement + (source ? ' where source = \''+ source + '\'': ''))
    console.log("# " + query)
    influx.query(query).then((rows) => { cb(rows) }, (err) => { console.log("Influx Query Error (get): " + err) })
  },
  getLatest: function(measurement, source, cb) {
    var query = sanitize('select * from ' + measurement + 
                (source ? ' where source = \''+ source + '\'': '') + 
                " order by time desc limit 1")
    console.log("# " + query)
    influx.query(query).then((rows) => { cb(rows) }, (err) => { console.log("Influx Query Error (getLatest): " + err) })
  },
  getSingle: function(measurement, item_id, cb) {
    var query = sanitize('select * from ' + measurement + 'where item_id = \'' + item_id + '\'')
    console.log("# " + query)
    influx.query(query).then((rows) => { 
      cb(rows)
      //Mark as processed
    }, (err) => { console.log("Influx Query Error (getSingle): " + err) })
  },
};
