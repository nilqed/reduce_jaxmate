

// Spawning App
const { spawn } = require('child_process');
const repl = spawn('redcsl', ['--nogui']);


// Server
var port = 3010;
var clientHTML = '/reduce_client.html';
//var clientHTML = '/frameset.html';
var dataID = '';
var inlineMath = true;   // replace $$ by $

var http = require('http');
var express = require('express');
var app = express();

var server = http.createServer(app);


// Passing the http.Server instance to the listen method
var io = require('socket.io')(server);  
//new:const { Server } = require("socket.io");
//neW:var io = new Server(server);


var fs = require("fs");


var input = process.stdin.pipe(repl.stdin);

// Input init/end handling
//input.on('quit;', () => {console.log('Goodbye\n'); process.exit() });
//input.on('%$\n', () => {inlineMath=false});
//input.on('%$$\n', () => {inlineMath=true});
input.write('off output;\n');
input.write('load_package "tri";\n'); // let __jaxmate__=true;
input.write('on tex;\n');
input.write('1;\n');
input.write('on output;\n');



// REPL on data event (response from REDUCE interpreter)
repl.stdout.on('data', (data) => {
  answer=data.toString();
  if (answer.endsWith(': ')){
    //debug:answer = answer.replace(/(\d+):(\s*)/g, '!**RED'); // rtrim reduce prompt '>'
    answer = answer.replace(/(\d+):(\s*)/g, '');
  };
  // tri.red defines prin2('!$!$); terpri(); return(nil) % end math group
  // we can intefere there or replace '$$' by '$'.
  if (answer.includes('(tex !: inline)')) {inlineMath=true};
  if (answer.includes('(tex !: eqmode)')) {inlineMath=false};
  if (inlineMath == true) { 
    answer = answer.replace('$$','$');
    answer = answer.replace('$$','$');
  }
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

// Expose the node_modules folder as static resources 
// (to access socket.io.js in the browser)
// maybe path.join(__dirname, 'directory')
app.use('/static', express.static('node_modules'));


// Handling the connection
io.on('connection', (socket) => {
    //console.log(socket.handshake);  // a lot of data without .handshake
    console.log("Client X connected @");

    socket.on('reduce_eval', (data) => {
        console.log('In['+data.id+']: '+data.data);
        input.write(data.data+'\n'); // send to repl process
        dataID=data.id; // push id
        // --> client debug: data.id/data.data
        //socket.emit('reduce_output',{id:data.id, data:'reduce_input:'+data.data});
    });
    
    socket.on('reduce_save', (data) =>  {
       fs.writeFile(data.filename, data.content, function (err) {
       if (err) throw err;
       console.log('File saved [ok].');});
    });
    
    socket.on('disconnect', function(){console.log('Client disconnect ...');});
});
