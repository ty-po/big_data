CREATE KEYSPACE IF NOT EXISTS tt WITH replication = {'class': 'SimpleStrategy', 'replication_factor': 1};

USE tt;

DROP TABLE raw;

CREATE TABLE IF NOT EXISTS raw (
  task_id uuid,
  source text,
  data text static,
  author text static,
  date timestamp,
  PRIMARY KEY (source, date, task_id)
);
