var express = require('express')
var app = express()

var amqp = require('amqplib/callback_api')

var uuid = require('uuid/v4')

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

app.get('/', function (req, res) {
  res.send("// W - W - W Data Api")
})

app.use('/raw', express.static('raw'))

app.get('/index/:sym', function(req,res) {
	amqp.connect('amqp://rabbit-pq', function(err, conn) {
		conn.createChannel(function(err, ch) {
			ch.assertQueue('', {exclusive: true}, function(err, q) {
				var corr = uuid();
				var sym = req.params.sym;

				console.log(' [x] Requesting ' + sym);

				ch.consume(q.queue, function(msg) {
					if (msg.properties.correlationId == corr) {
						res.send(msg.content.toString())
						setTimeout(function() { conn.close() }, 500);
					}
				}, {noAck: true});

				ch.sendToQueue('job_q',
				new Buffer(sym.toString()),
				{ correlationId: corr, replyTo: q.queue });
			});
		});
	});
})



app.listen(4040, function () {
  console.log('Data API on port 4040')
})


