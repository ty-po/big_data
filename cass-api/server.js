const cassandra = require('cassandra-driver');
const client = new cassandra.Client({contactPoints: ['cass'], keyspace:'tt'});
client.connect((err) => {
	console.log("STATUS Connection:" + (err ? err : "OK"));
})

const express        = require('express');
const bodyParser     = require('body-parser');
const uuid           = require('uuid/v4');

const app            = express();

const port = 8080;

app.use(bodyParser.json());

app.get("/", (req, res) => {
	res.send("Home");
});

app.post("/raw", (req, res) => {
	console.log(req.body);
	query = "INSERT INTO raw (date, task_id, source, author, data) VALUES (?,?,?,?,?)"; 
	params = [req.body.date, uuid(), req.body.source, req.body.author, req.body.data];
	client.execute(query, params, {prepare: true}, (err) => {
		console.log("Status Insert: " + (err ? err : "OK"));
		res.send((err ? err : "OK"));
	});
});

app.get("/raw", (req, res) => {
	client.execute("SELECT date, task_id, source FROM raw LIMIT 32", (err, cres) => {
		console.log("STATUS Select: " + (err ? err : "OK"))
		res.send(err ? err : cres.rows);
	});
});

app.get("/raw/:source", (req, res) => {
	client.execute("SELECT date, task_id, source FROM raw WHERE source='" + req.params.source + "'", (err, cres) => { //TODO: May be a performance issue
		console.log("STATUS Source: " + (err ? err : "OK"))
		res.send(err ? err : cres.rows);
	});
});
app.get("/raw/latest/:source", (req, res) => {
	client.execute("SELECT date, task_id, source FROM raw WHERE source='" + req.params.source + "' ORDER BY date DESC", (err, cres) => { //TODO: Fix ALLOW FILTERING
		console.log("STATUS Source DESC: " + (err ? err : "OK"))
		res.send(err ? err : (cres.rows ? cres.rows[0].date : cres.rows));
	});
});


app.get("/raw/:source/:id", (req, res) => {
	client.execute("SELECT * FROM raw WHERE task_id=" + req.params.id, (err,cres) => {
		console.log("STATUS Single: " + (err ? err : "OK"));
		res.send(err ? err : cres.rows);
		client.execute("DELETE FROM raw WHERE source='" + req.params.source + "' AND task_id=" + req.params.id, (err, dres) => {
			console.log("STATUS Delete: " + (err ? err : "OK"));
		});
	});
});

app.listen(port, () => {
	console.log("Listening on " + port);
});
