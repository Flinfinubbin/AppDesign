var http = require( 'http' );
var fs = require( 'fs' );

function server_fun( req, res )
{
    // console.log( req );
    console.log( req.url );
    res.writeHead( 200 );
    res.end( "Hello world" );
    try {
    	var file = fs.readFileSync(req);
    }
    catch {
    	console.log("Error: Couldn't locate the file");
    }
}

var server = http.createServer( server_fun );

server.listen( 8080 );