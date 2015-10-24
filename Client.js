#!/usr/bin/env nodejs
// Client to simulates an Tower Transmitter, 
// interval shall be passed as a command line argument
// At a given interval client shall keep sending the random generated
// transmitter data to the server
// The updatedb() function shall form the jason msg to be sent over websocket

var ServerConfig = require('config');
var format = require('util').format;
var WebSocketClient = require('websocket').client;

var Interval = process.argv[2]; // second parameter as interval
var TransmitterId = "trans_" + process.argv[3];
var ConnDeviceLimit = 15;
var ServerConn;

// Returns a random number between min (inclusive) and max (exclusive)
function getRandomArbitrary(min, max)
{
  return Math.floor(Math.random() * (max - min)) + min;
}

// Returns no.of charge counts
function DeviceConnectedCount(min, max,TotalDeviceCount)
{
  var count = 1;
  var DeviceCount = "";  

  for (count; count <= TotalDeviceCount; count++) {
    DeviceCount = DeviceCount+ getRandomArbitrary(min,max).toString() + ',';
  }
 
 return DeviceCount;
}

// Returns Timestamp in YYYY-MM-DDhh:mm:ss.sss format
function GetTimeStamp()
{
  var thetime = new Date().toISOString().replace(/T/, '').replace(/Z/, '');
  return thetime;	
}

// Update Trasnsmitter ID,Time Stamp,Devices Connected Charge
function UpdateDb()
{  
  var timeStamp 	= GetTimeStamp();
  var devicesConnected 	= getRandomArbitrary(0, ConnDeviceLimit);
  var chargeValue 	= DeviceConnectedCount(1, 100,devicesConnected);

  var msg = {
    timestamp: timeStamp,
    transmitterid: TransmitterId ,
    devicesconnected: devicesConnected,
    chargevalue: chargeValue
  };

  if (ServerConn.connected) {
    ServerConn.send(JSON.stringify(msg));
    setTimeout(UpdateDb, Interval);
  }
}

function txclient()
{
  // server port and ipaddress from config.js
  var serverPort = ServerConfig.ServerPort;
  var serverIP = ServerConfig.ServerIP;

  var wsurl = 'ws://' + serverIP + ":" + serverPort;

  var client = new WebSocketClient();

  console.log('Starting txclient...');

  if (typeof process.argv[3] === 'undefined') {
    TransmitterId = "trans_1";
  }
  console.log('TransnitterId: ' + TransmitterId);

  if (typeof Interval === 'undefined') {
    Interval = 5000;
  }
  console.log('Interval: ' + Interval);

  client.connect(wsurl, 'poc-protocol');

  client.on('connectFailed', function(error) {
    console.log('Connection Failed Error: ' + error.toString());
  });

  client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');

    ServerConn = connection;
    connection.on('error', function(error) {
        console.log("Connection on connect Error: " + error.toString());
    });

    connection.on('close', function() {
        console.log('echo-protocol Connection Closed');
    });

    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log("Received: '" + message.utf8Data + "'");
        }
    });
    
    UpdateDb();
  });
}

txclient();

