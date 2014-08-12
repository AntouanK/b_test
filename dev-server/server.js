
var http        = require('http'),
    fs          = require('fs'),
    path        = require('path'),
    express     = require('express'),
    // querystring = require('querystring'),
    app         = express(),
    morgan      = require('morgan'),
    compression = require('compression'),
    //  variables
    deployPath = __dirname + '/../deploy';

app.use( morgan({ format: 'dev' }) );

app.use(compression());

app.use(express.static(deployPath));
console.log('cwd : '+path.resolve(deployPath));

app.listen(8000);
