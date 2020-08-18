const express = require('express');
const argv = require('minimist')(process.argv.slice(2));

const app = express();

app.use(express.static('dist'));

const port = argv['config-port'] || 3000;

app.listen(port, () => {
  console.log("server/index.js. Webserver listening at port:", port);
});
