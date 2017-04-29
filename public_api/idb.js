const uuid    = require('uuid/v4')
const Influx  = require('influx');
const influx  = new Influx.InfluxDB({
  host: 'influx',
  database: 'tt',
  schema: [
    {
      measurement: 'raw',
      fields: {
        author: Influx.FieldType.STRING,
        data: Influx.FieldType.STRING
      },
      tags: [
        'source',
        'task_id',
      ]
    }
  ]
})

function sanitize(query) {
  return query.replace(';', "NULL")
}

module.exports = {
  push: function(date, source, author, data, cb) {
    influx.createDatabase('tt')
    console.log(date)
    console.log(source)
    influx.writePoints([{
      measurement: 'raw',
      tags: { source: source, task_id: uuid() },
      fields: { author: author, data: data },
      timestamp: date,
    }],{
      precision: 'ms'
    }).catch((err)=> { console.log("Influx Write Error: " + err) })
  },
  get: function(measurement, source, cb) {
    var query = sanitize('select * from ' + measurement + (source ? ' where source = \''+ source + '\'': ''))
    console.log("# " + query)
    influx.query(query).then((rows) => { cb(rows) }, (err) => { console.log("Influx Query Error (get): " + err) })
  },
  getLatest: function(measurement, source, cb) {
    var query = sanitize('select source,task_id,author from ' + measurement + 
                (source ? ' where source = \''+ source + '\'': '') + 
                " order by time desc limit 1")
    console.log("# " + query)
    influx.query(query).then((rows) => { cb(rows) }, (err) => { console.log("Influx Query Error (getLatest): " + err) })
  },
  getSingle: function(measurement, task_id, cb) {
    var query = sanitize('select * from ' + measurement + 'where task_id = \'' + task_id + '\'')
    console.log("# " + query)
    influx.query(query).then((rows) => { 
      cb(rows)
      //Mark as processed
    }, (err) => { console.log("Influx Query Error (getSingle): " + err) })
  },
};
