// POC Sample using mongoose + express
// nodejs server.js
// bash runclients.sh -s 172.16.11.43 -p 8081 -n 100 start

var http = require('http');
var serverConfig = require('config');
var WebSocketServer = require('websocket').server;

var transmitterId;
var timeStamp;
var devicesConnected;
var chargeValue;
var count = 0;

var express = require('express');

var app = express();

var server = http.createServer(app); 

// Start the server
server.listen(serverConfig.ServerPort);

// Create websocket server
var wss = new WebSocketServer({
  httpServer: server,
  autoAcceptConnections: false
});
 
console.log('nodejs websocket Server running');

// accept messages on websocket
wss.on('request', function(request) {
  console.log('incoming connection');

  var connection = request.accept('poc-protocol', request.origin);
  console.log((new Date()) + ' Connection accepted');

  connection.on('message', function(message) {
    if (message.type === 'utf8') {
        parseJsonMessage(message.utf8Data);
        } 
    else if (message.type === 'binary') {
        console.log('Received Binary Message of ' +
        message.binaryData.length + ' bytes');
        connection.sendBytes(message.binaryData);
        }
   });

   connection.on('close', function(reasonCode, description) {
     console.log((new Date()) + ' Peer ' + connection.remoteAddress +
                  ' disconnected.');
   });
}); 

// retreive the mongoose model
var TransmitterDoc = require("transmitterModel.js");

// parse the packet received on websocket & Update db
function parseJsonMessage(event) {
  var msg = JSON.parse(event);
  transmitterId = msg.transmitterid;
  timeStamp = msg.timestamp;
  devicesConnected = msg.devicesconnected;
  chargeValue = msg.chargevalue;
  count = 0;

  var insertdoc = new TransmitterDoc({transmitterId:transmitterId,
                       timeStamp:timeStamp,
                       devicesConnected:devicesConnected,
                       chargeValue:chargeValue});

  // save the document in the database
  insertdoc.save(function(err,doc) {

    if (err) {
       return err;
    } else {
      TransmitterDoc.count({}, function(err, count) {
        console.log('Data Received,Count is : ' + count);
      });
    }
  });
};


// REST Services
// request from browser
app.get('/', function(req,res) {
  res.send("POC Transmission Server:\n" +
           "<a href='/Report'> Show Transmitters </a>");
});

// request from browser to show all documents
app.get('/Report', function (req, res) {
  TransmitterDoc.find({},function (err, docs) {
    printdocuments(res,docs);
  });
});

// request from browser to query documents based on transmiter id
app.get('/Report/:transId', function(req, res, next) {
  TransmitterDoc.find({transmitterId:req.params.transId},function (err, docs) {

    var username = req.params.transId;

    console.log('User name: ', username);
    printdocuments(res,docs);
  });
});

// funciton shall print the records
function printdocuments(res,docs) {
  res.writeHead(200, { 'Content-Type: text/html'});
  res.write('<h1>POC Transmitter Server</h1>\n');

  var data = '<table border="1" cellpadding="0" cellspacing="0" ' +
             'width="100%"><tr>' +
             '<td><strong> Trasnsmitter ID</strong></td>' +
             '<td><strong> Time Stamp</strong></td>' +
             '<td><strong>&nbsp;Devices Connected</strong></td>' +
             '<td><strong> Charge</strong></td></tr>';

  res.write(data);

  docs.forEach(function(doc) {
    data = '<tr><td>' + doc.transmitterId + '</td>' +
           '<td>' + doc.timeStamp + '</td>' +
           '<td>' + doc.devicesConnected + '</td>' +
           '<td>' + doc.chargeValue + '</td></tr>';
    res.write(data);
  });

  res.write('</table>');

  // get a total count 
  TransmitterDoc.count(function(err, count) {
    res.write('Total Records: ' + count);
    console.log('Total Records: ', count);
  });
  res.end();
};

