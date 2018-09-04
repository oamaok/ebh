import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

import config from './config';
import log from './debug';

const sqlite = process.env.NODE_ENV === 'production' ? sqlite3 : sqlite3.verbose();

const promisifyDbCall = fnName => (db, ...args) => new Promise(
  (resolve, reject) => db[fnName](...args, (err, res) => {
    if (err) reject(err); else resolve(res);
  }),
);

const pRun = promisifyDbCall('run');
const pAll = promisifyDbCall('all');
const pExec = promisifyDbCall('exec');

export async function initializeDatabase() {
  log('Initializing database.');

  const databaseFile = process.env.USE_IN_MEMORY_DB === 'true'
    ? ':memory:'
    : path.resolve(__dirname, config.database.file);

  log(`Using ${databaseFile} as database file.`);

  if (databaseFile !== ':memory:' && fs.existsSync(databaseFile)) {
    log('File exists, attempting to use as database.');
    return new sqlite.Database(databaseFile);
  }

  if (databaseFile !== ':memory:') {
    // Touch the database file
    log('Creating database file.');
    fs.closeSync(fs.openSync(databaseFile, 'w'));
  }

  const database = new sqlite.Database(databaseFile);

  log('Initializing database schema.');

  // Read database schema file and run it
  const schema = fs.readFileSync(path.resolve(__dirname, 'schema.sql')).toString();
  await pExec(database, schema);


  log('Database schema initialized.');

  return database;
}

export const addBeerTypes = (db, beerTypes) => Promise
  .all(beerTypes.map(beerType => pRun(db, 'INSERT INTO beerTypes (name) VALUES ($1)', beerType)));

export const getBeerTypes = db => pAll(db, 'SELECT *, rowid FROM beer_types');

export const addBars = (db, bars) => Promise
  .all(bars.map(bar => pRun(db, `
    INSERT INTO
      bars (
        name,
        startTime,
        endTime,
        lon, lat
      )
    VALUES
      ($name, $startTime, $endTime, $lon, $lat)
  `, {
    $name: bar.name,
    $startTime: bar.startTime,
    $endTime: bar.endTime,
    $lon: bar.lon,
    $lat: bar.lat,
  })));

export const getBars = db => pAll(db, 'SELECT *, rowid FROM bars');

export const addBeer = (db, beer) => pRun(db, `
  INSERT INTO
    beers (
      barId,
      typeId,
      personId,
      personName,
      abv,
      volume
    )
  VALUES
    (
      $barId,
      $typeId,
      $personId,
      $personName,
      $abv,
      $volume
    )
`, {
  $barId: beer.barId,
  $typeId: beer.typeId,
  $personId: beer.personId,
  $personName: beer.personName,
  $volume: beer.volume,
  $abv: beer.abv,
});

export const updateBeerReview = (db) => {};

export const updateBeerStarRating = (db) => {};

export const deleteBeer = (db) => {};

export const getBeers = db => pAll(db, 'SELECT *, rowid FROM beers');
