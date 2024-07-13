let express = require('express');
var app = require('express')();

var http = require('http').Server(app);

var port = process.env.PORT || 8080;

let path = require( 'path' );

app.use( '/dist', express.static( path.join( __dirname, 'dist' ) ) );
app.use('/example', express.static(__dirname + '/example'));

app.use(( req, res, next ) => {
    res.setHeader( 'X-Powered-By', 'WebRTC IP v3.3.4' );
    next();
});

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/example/index.html')
});

http.listen(port, function(){
    console.log('Listening on port: ' + port)
})