

// Spawning App
const { spawn } = require('child_process');
const repl = spawn('redcsl.bat', ['--nogui']);


// Server
var port = 3010;
var clientHTML = '/reduce_client.html';
var dataID = '';


var http = require('http');
var express = require('express');
var app = express();

// Bodyparser for GET/POST requests only
app.use( express.urlencoded({extended: true}));
app.use(express.json());

// The server
var server = http.createServer(app);


// Passing the http.Server instance to the listen method
var io = require('socket.io')(server);  

// Filesystem for saving 
var fs = require("fs");

// Input pipe
var input = process.stdin.pipe(repl.stdin);

// Input init/end handling
// input.on('bye;', () => {console.log('Goodbye\n'); process.exit() });
input.write('off output;\n');
input.write('load_package "tri";\n'); 
input.write('on tex;\n');
input.write('1;\n');
input.write('on output;\n');



// REPL on data event (response from REDUCE interpreter)
repl.stdout.on('data', (data) => {
  answer=data.toString();
  if (answer.endsWith(': ')){
    answer = answer.replace(/(\d+):(\s*)/g, '');
  };
 
  console.log(`Out[${dataID}]:\n${answer}`);
  io.emit('reduce_output',{id:dataID, data:answer});
});


// The server starts listening
server.listen(port);
console.log ("Welcome to REDUCE");
console.log("REDUCE Server listening on port "+ port.toString());

// Registering the route of your app that returns the HTML start file
app.get('/', function (req, res) {
    console.log("App root");
    res.sendFile(__dirname + clientHTML);
});

// Expose the node_modules folder as static resource
// e.g. to access socket.io.js in the browser
app.use('/static', express.static('node_modules'));


// Other instances to serve GET/POST requests [todo:optional]
// This responds a GET request
app.get('/eval', function (req, res) {
   console.log("GET request for /eval:"+req.body);
   res.send('GET EVAL:'+req.body.data);
})

// This responds a POST request
app.post('/eval', function (req, res) {
   console.log("POST request for /eval:"+req.body);
   res.send('POST EVAL'+req.body.data);
})

// This responds a DELETE request for the /del page.
app.delete('/del', function (req, res) {
   console.log("Got a DELETE request for /del_user");
   res.send('Hello DELETE');
})

// This responds a GET request for the /list page.
app.get('/list', function (req, res) {
   console.log("GET request for /list");
   res.send('LIST something');
})

// This responds a GET request for abcd, abxcd, ab123cd, and so on
app.get('/ab*cd', function(req, res) {   
   console.log("GET request for /ab*cd");
   res.send('PATTERN MATCH');
})
/////



// Handling the connection
io.on('connection', (socket) => {
    //console.log(socket.handshake); //a lot of data without .handshake
    console.log("Client X connected @");

    // data = {id:?, data:?}, i.e. data.id and data.data
    socket.on('reduce_eval', (data) => {
        console.log('In[' + data.id +']: ' + data.data);
        input.write(data.data + '\n');  // send to repl process
        dataID=data.id;                 // push id (global dataID)
        // --> client debug: data.id/data.data
        //socket.emit('reduce_output',{id:data.id, data:'reduce_input:'+data.data});
    });
    
    socket.on('reduce_save', (data) =>  {
       fs.writeFile(data.filename, data.content, function (err) {
       if (err) throw err;
       console.log('File saved [ok].');});
    });
    
    socket.on('disconnect', function()
      {console.log('Client disconnect ...');  
        process.exit();});  // sure?  
});
