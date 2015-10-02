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
    // console.log( kvs );
    return kvs
}

function server_fun( req, res )
{
    console.log( req.url );
    // ...
    var filename = "./" + req.url;
    try {
        var contents = fs.readFileSync( filename ).toString();
        res.writeHead( 200 );
        res.end( contents );
    }
    catch( exp ) {
        if( req.url.indexOf( "first_form?" ) >= 0 )
        {
            var kvs = getFormValuesFromURL( req.url );
            res.writeHead( 200 );
            res.end( "You submitted the first form!!!!! " + kvs[ "how_many" ] );
        }
        else if( req.url.indexOf( "second_form?" ) >= 0 )
        {
            var kvs = getFormValuesFromURL( req.url );
            res.writeHead( 200 );
            res.end( "You submitted the second form!!!!!" );
        }
        else
        {
            res.writeHead( 404 );
            res.end( "Cannot find file: "+filename );
        }
    }
}

var server = http.createServer( server_fun );
server.listen( 8080 );