var fs = require( 'fs' );
var http = require( 'http' );

function getFormValuesFromURL( url )
{
    var kvs = {};
    var parts = url.split( "?" );
    var key_value_pairs = parts[1].split( "&" );
    for( var i = 0; i < key_value_pairs.length; i++ )
    {
        var key_value = key_value_pairs[i].split( "=" );
        kvs[ key_value[0] ] = key_value[1];
    }
    return kvs
}

function server_run( req, res )
{
    var filename = "./" + req.url;
    console.log(filename);
    try {
        var contents = fs.readFileSync( filename ).toString();
        res.writeHead( 200 );
        res.end( contents );
    }
    catch( exp ) {
        if( req.url.indexOf( "first_form?" ) >= 0 )
        {
            var kvs = getFormValuesFromURL( req.url );
            var output = dictToString(kvs);
            makeFile(output);
            res.writeHead( 200 );
            res.end( "You submitted the first form!!!!! " + kvs[ "how_many" ] );
        }
        else if( req.url.indexOf( "second_form?" ) >= 0 )
        {
            var kvs = getFormValuesFromURL( req.url );
            var output = dictToString(kvs);
            makeFile(output);
            res.writeHead( 200 );
            res.end( "You submitted the second form!!!!!" + kvs["how_many"]);
        }
        else
        {
            res.writeHead( 404 );
            res.end( "Cannot find file: "+filename );
        }
    }
}

/* If there is not file, create and write
	otherwise: read existing file and append to it
*/

function makeFile(info) {
	var filename = "server_log.txt";
	try {
		var old_info = fs.readFileSync(filename).toString();
		info = old_info + "\n" + info;
		fs.writeFileSync(filename, info);
	}
	catch(exp) {
		console.log("Creating file")
		fs.writeFileSync(filename, info);
	}
}

function dictToString(dict) {
	var newString = "";
	for (var i = 0; i < dict.length; i++)
	{
		
	}
}

var server = http.createServer( server_run );
server.listen( 8080 );