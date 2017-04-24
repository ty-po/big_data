const cassandra = require('cassandra-driver');
const client = new cassandra.Client({contactPoints: ['cass'], keyspace:'tt'});
client.connect((err) => {
	console.log(err);
})

const express        = require('express');
const bodyParser     = require('body-parser');
const uuid           = require('uuid/v4');

const app            = express();

const port = 8080;

app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
	res.send("Home");
});

app.post("/raw", (req, res) => {
	console.log(req.body);
	query = "INSERT INTO raw (date, task_id, source, author, data) VALUES (?,?,?,?,?)";
	params = [Date.now(), uuid(), req.body.source, req.body.author, req.body.data];
	client.execute(query, params, {prepare: true}, (err) => {
		console.log("Status Insert: " + err);
		res.send(err);
	});
});

app.get("/raw", (req, res) => {
	client.execute("SELECT date, task_id FROM raw LIMIT 10", (err, cres) => {
		res.send(cres.rows);
		console.log("STATUS Select: " + err)
	});
});

app.get("/raw/:id", (req, res) => {
	client.execute("SELECT * FROM raw WHERE task_id=" + req.params.id, (err,cres) => {
		res.send(cres.rows);
		console.log("STATUS Single Select: " + err);
		client.execute("DELETE FROM raw WHERE task_id=" + req.params.id, (err, dres) => {
			console.log("STATUS Delete: " + err);
		});
	});
});


app.listen(port, () => {
	console.log("Listening on " + port);
});
