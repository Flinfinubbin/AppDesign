var http = require( 'http' );
var fs   = require( 'fs' );

if( process.argv.length < 3 )
{
    console.log( "Error: File required" );
    process.exit( 1 );
}

var filename = process.argv[ 2 ];

try
{
    var lines = fs.readFileSync( filename ).toString().split( "\n" );
}
catch( e )
{
    console.log(
        "Error: Something bad happened trying to open " + filename);
    process.exit( 1 );
}

function download( url, dest, callback )
{
    var file = fs.createWriteStream( dest );

    var request = http.get( url, function( response ) {
        file.on( 'finish', function() {
            console.log( "Finished writing!" );
        } );
        response.pipe( file );
    } );

    // Not temporally after the "get" is done!!!!!!!!

    request.on( 'error', function( err ) {
        console.log( "Error!!!", err );
    } );

    console.log( "Sent request" );
}

var files = [];

/* download all the things! */

for (var i = 0; i < lines.length; i++) {
    // separate the filename from the url
    var split_string = lines[i].split(/\s+/);
    console.log(split_string);
    var files_plus = {name: split_string[0], file: download(split_string[1],
        split_string[0], null)};
}
