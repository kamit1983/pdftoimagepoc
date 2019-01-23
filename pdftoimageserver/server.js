const express        = require('express');
const MongoClient    = require('mongodb').MongoClient;
const bodyParser     = require('body-parser');
const fileUpload = require('express-fileupload');
const app            = express();
app.use(fileUpload());
app.use('/tmp',express.static('tmp'));
app.use('/public',express.static('public'));
app.use('node_modules', express.static('node_modules'));
const port = 8000;

require('./routes')(app);
app.listen(port, () => {
  console.log('We are live on ' + port);
});