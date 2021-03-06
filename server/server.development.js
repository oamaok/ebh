/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable global-require */
/* eslint-disable no-console */

import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import chokidar from 'chokidar';
import middleware from 'webpack-hot-middleware';
import express from 'express';
import path from 'path';
import config from '../webpack.development.config';

const API_PORT = 3000;

const compiler = webpack(config);
const devServer = new WebpackDevServer(compiler, {
  hot: true,
  stats: { colors: true },
  historyApiFallback: true,
  public: 'ebh.tunk.io:8080',
  proxy: {
    '/api': {
      target: `http://localhost:${API_PORT}`,
      ws: true,
    },
  },
});

devServer.use(middleware(compiler));
devServer.listen(8080);
devServer.use('/assets', express.static(path.resolve(__dirname, '../assets')));

let app;
let server;

try {
  app = require('./server').default;
  server = app.listen(API_PORT);
} catch (err) {
  console.error(err);
}

const pathsToWatch = [
  __dirname,
];

const watcher = chokidar.watch(pathsToWatch, {
  ignored: [path.resolve(__dirname, 'data')],
});

watcher.on('ready', () => {
  console.log('Watching...');
  watcher.on('all', () => {
    process.stdout.write('Change detected in the server directory. \nClearing module cache and restarting the server... ');

    // Don't reload any of the modules in the node_modules directory
    Object.keys(require.cache)
      .filter(id => !id.includes('node_modules'))
      .forEach((id) => {
        delete require.cache[id];
      });

    if (server && server.close) {
      server.close(() => {
        try {
          app = require('./server').default;
          server = app.listen(API_PORT);
          process.stdout.write('Done! \n');
        } catch (err) {
          process.stdout.write('Error! \n');
          console.error(err);
        }
      });
    } else {
      try {
        app = require('./server').default;
        server = app.listen(API_PORT);
        process.stdout.write('Done! \n');
      } catch (err) {
        process.stdout.write('Error! \n');
        console.error(err);
      }
    }
  });
});
