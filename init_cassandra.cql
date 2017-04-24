CREATE KEYSPACE IF NOT EXISTS tt WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};

USE tt;

CREATE TABLE IF NOT EXISTS raw (
  task_id uuid,
  source text static,
  data text static,
  author text static,
  date timestamp,
  PRIMARY KEY (task_id,date)
);
