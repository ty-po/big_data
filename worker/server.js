var request = require('request')
var parse = require('csvtojson')
var amqp = require('amqplib/callback_api')

const data_api = "http://ttdev.ty-po.com:4040"
const stock_api = "http://ttdev.ty-po.com:2020"

var weather = []
var conflict = []
var marriage = []
var stock = []
var index = []


prefetch(() => {
  console.log(weather.length)
  console.log(conflict.length)
  console.log(marriage)
  amqp.connect('amqp://rabbit-pq', function(err, conn) {

   conn.createChannel(function(err, ch) {
      var q = 'rpc_queue';

      ch.assertQueue(q, {durable: false});
      ch.prefetch(1);
      console.log(' [x] Awaiting RPC requests');
      ch.consume(q, function reply(msg) {
        var symbol = parseInt(msg.content.toString());

        console.log(symbol);

        var r = analysis(symbol);

        ch.sendToQueue(msg.properties.replyTo,
          new Buffer(r.toString()),
          {correlationId: msg.properties.correlationId});

        ch.ack(msg);
      });
    });
  })
})

function prefetch(cb) {
  collected = 0
  fetch_metrics('/raw/weather.csv', weather, () => {
    collected += 1
    if (collected == 3) cb()
  })
  fetch_metrics('/raw/conflict.csv', conflict, () => {
    collected += 1
    if (collected == 3) cb()
  })
  fetch_metrics('/raw/marriage.csv', marriage, () => {
    collected += 1
    if (collected == 3) cb()
  })
}

function fetch_metrics(url, target_array, cb) {
  request(data_api + url, (err, wres, body) => {
    if (err) console.log(err)
    else {
      parse({noheader:false})
        .fromString(body)
        .on('json',(parsed)=>{
            target_array.push(parsed)
        })
        .on('done',(x)=>{
          cb()
        })
    }
  })
}

function analysis(symbol) {
	return [1,2,3,4,5]
}
