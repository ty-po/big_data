var request = require('request')
var parse = require('csvtojson')
var amqp = require('amqplib/callback_api')

const data_api = "http://ttdev.ty-po.com:4040"
const stock_api = "http://ttdev.ty-po.com:2020"

var preweather = []
var preconflict = []
var premarriage = []

var weather = {}
var conflict = {}
var marriage = {}
var stock = {}
var index = []


prefetch(() => {
  amqp.connect('amqp://rabbit-pq', function(err, conn) {

   conn.createChannel(function(err, ch) {
      var q = 'job_q';

      ch.assertQueue(q, {durable: false});
      ch.prefetch(1);
      console.log(' [x] Awaiting RPC requests');
      ch.consume(q, function reply(msg) {
        //console.log(msg.content)
        var symbol = msg.content;

        console.log("Analyzing " + symbol.toString());

        analysis(symbol, (res) => {
          ch.sendToQueue(msg.properties.replyTo,
            new Buffer(res),
            {correlationId: msg.properties.correlationId});

          ch.ack(msg); 
        });
      });
    });
  })
})

function analysis(symbol, cb) {
  request(stock_api + '/data/stock/' + symbol, (err, wres, body) => {
    if (err) return err
    else {
     // console.log(body)
      averageMonths(JSON.parse(body), stock, () => {

        //console.log(stock)
        //console.log(weather)  //M/1/y

        //console.log(marriage) //M/Y
        //meat here
        var sr = 0
        var sc = 0
        for (key in stock) {
          month = key.split("/")[0].toString()
          year = key.split("/")[1].toString()
          s = stock[month + "/" + year]
          w = weather[month + "/1/" + year]
          c = conflict[year]
          m = marriage[month + "/" + year]

          /*
          console.log(s)
          console.log(w)
          console.log(c)
          console.log(m)
          */

          // Index Calculation //
          current = {
            time: new Date(month + "/1/" + year).toISOString(),
            index: 0,
            stock: 0,
          }

          if (s) {
            sa = s['sum'] / s['count']
            sr += sa
            sc += 1
          }
          
          if (w) {
            ww = w['Average Wind Speed']
            wp = w['Precipitation']
            ws = w['Snowfall']
            wt = w['Average Temperature']

            ta = 55.384
            wa = 4
            sm = 0
            pm = 3.56

            ti = 2 * (wt / ta) - 1
            wi = 1 - (ww / wa)
            si = -(ws / 25)
            pi = 1 - (wp / pm)

            current.index += ti + wi + si + pi
          }
          
          if (c) {
            cn = c['natural']
            ch = c['human']
            cz = c['hazard']
            cs = c['socioeco']
            cg = c['groups']
            cv = c['vulnerability']
            ci = c['institutional']
            cf = c['infrastructure']
            cc = c['capacity']
            cr = c['risk']
          }
          
          if (m) {
            mm = m['Marriages']
          }

          index.push(current)
          if (index.length == Object.keys(stock).length) {
            console.log('done')
            cb(JSON.stringify(index))
          }
        }
      })
    }
  })
}

function averageMonths(stock_prices, target_obj, cb) {
  stock_prices.forEach((e, i) => {
    if(i == stock_prices.length -1) {
      cb()
    }
    else {
      month = new Date(e.time).getMonth() + 1
      year = new Date(e.time).getFullYear()
      key = month + "/" + year
      target_obj[key] = target_obj[key] || { count: 0, sum: 0 }
      target_obj[key].count += 1
      target_obj[key].sum += e.close
    }
  })
}

function demap(key, target_arr) {
    var obj = target_arr.reduce(function(obj,item){
        obj[item[key]] = item; 
        return obj;
    },{});
  return obj
}

function prefetch(cb) {
  collected = 0
  fetch_metrics('/raw/weather.csv', preweather, () => {
    weather = demap('Date', preweather)
    collected += 1
    if (collected == 3) cb()
  })
  fetch_metrics('/raw/conflict.csv', preconflict, () => {
    conflict = demap('INFORM Year', preconflict)
    collected += 1
    if (collected == 3) cb()
  })
  fetch_metrics('/raw/marriage.csv', premarriage, () => {
    marriage = demap('Year', premarriage)
    collected += 1
    if (collected == 3) cb()
  })
}

function fetch_metrics(url, target_array, cb) {
  //console.log(target_array)
  request(data_api + url, (err, wres, body) => {
    if (err) console.log(err)
    else {
      parse({noheader:false})
        .fromString(body)
        .on('json',(parsed) => {
            target_array.push(parsed)
        })
        .on('done',(x)=>{
          cb()
        })
    }
  })
}
