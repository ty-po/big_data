var idb = require('tt-idb')

var schedule = require('node-schedule');

var Client = require('node-rest-client').Client;
var client = new Client();

var api_key = process.env.NEWS_AUTH
var worker_id = process.env.NEWS_WORKER_ID
var pool_size = process.env.NEWS_WORKERS

startWorker(worker_id, pool_size, api_key);

function startWorker(worker, workers, auth) {
  client.get("https://newsapi.org/v1/sources?language=en&country=us", function (data, response) {
      getAll(data.sources.map((item) => { return item.id }), auth);
      //TODO: split by worker
  });
};

function getAll(data, auth) {
  console.log("Fetching the following sources: " + data);
  var j = schedule.scheduleJob('* /20 * * * *', () => { //Every Minute on 42 secs TODO: Slow down
    data.forEach((source) => {
      console.log("Processing " + source)
      idb.getLatest('raw', source, (res) => {
        if(res.length > 0) last_stored = new Date(res[0].time.valueOf())
        else last_stored = 0
        console.log("Last Stored: " + last_stored)
        get(source, auth, last_stored)
      })
    })
  })
}

function get(source, auth, last_stored) {
  client.get("https://newsapi.org/v1/articles?source=" + source + "&sortBy=latest&apiKey=" + auth,
              (data, response) => {
    if(data.articles) {
      data.articles.forEach((article) => {
        date = new Date(article.publishedAt)
        if(date > last_stored) {
          console.log("Pushing article")
          idb.push(date, data.source, article.author, article.title + '\t' + article.description);
        }
        else console.log("Skipping article")
      })     
    }
  });
}
