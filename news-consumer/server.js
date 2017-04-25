var schedule = require('node-schedule');
var Client = require('node-rest-client').Client;
var client = new Client();

var api_key = process.env.NEWS_AUTH
var worker_id = process.env.NEWS_WORKER_ID
var pool_size = process.env.NEWS_WORKERS

//startWorker(worker_id, pool_size, api_key);

function startWorker(worker, workers, auth) {
  client.get("https://newsapi.org/v1/sources?language=en&country=us", function (data, response) {
      getAll(data.sources.map((item) => { return item.id }), auth);
      //TODO: split by worker
  });
};

function getAll(data, auth) {
  console.log("Fetching the following sources: " + data);

  var j = schedule.scheduleJob('42 * * * * *', () => { //Every Minute on 42 secs TODO: Slow down
    data.forEach((source) => {
      get(source, auth)
    })
  })
}

function get(source, auth) {
  client.get("https://newsapi.org/v1/articles?source=" + source + "&sortBy=latest&apiKey=" + auth,
              (data, response) => {
    data.articles.forEach((article) => {
      push(article.publishedAt, "news", data.source, article.title + '\t' + article.description);
    })               
  });
}

function push(date, source, author, data) { //TODO: Add callback?
  var args = {
    data: { date: date, source: source, author: author, data: data },
    headers: { "Content-Type": "application/json" }
  }
  client.post("http://cass-api:8080/raw", args, (data, response) => {
    console.log(data)
  })
};
