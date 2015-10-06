var fs = require('fs');
var http = require('http');
var sql = require('sqlite3').verbose();

/*
	Get the query values from the incoming url
	Open the database
	Get all rows from lower to upper bound
	Write rows to page as html
*/

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

function getTime(value)
{
	var parts = value.split("%3A");
	var hour = parseInt(parts[0]);
	var minutes = parseInt(parts[1]);
	return hour*60 + minutes;
}

function cull(rows, start, end)
{	
	var length = Object.keys(rows).length;
	var in_range = [];
	for (var i = 0; i < length; i++) {
		var row = rows[i];
		var time = row['AbsTime'];
		if (time > start && time < end) {
			in_range.push(rows[i])
		}
	}
	return in_range;
}

function formatHelper(row)
{
	var text = "";
	text += "<td>Time: " + row['Time'] + "</td>";
	text += "<td>Dew Point: " + row["Dew Point"] + "</td>";
	text += "<td> Humidity: " + row["Humidity"] + "</td>";
	text += "<td>Sea Level Pressure: " + row["Sea Level Pressure"] + "</td>";
	text += "<td>Visibility: " + row["Visibility"] + "</td>";
	text += "<td>Wind Direction: " + row["Wind Direction"] + "</td>";
	text += "<td>Wind Speed: " + row["Wind Speed"] + "</td>";
	text += "<td>Gust Speed: " + row["Gust Speed"] + "</td>";
	text += "<td>Precipitation: " + row["Precipitation"] + "</td>";
	text += "<td>Conditions: " + row["Conditions"] + "</td>";
	text += "<td>Wind Direction Degrees: " + row["Wind Degrees"] + "</td>";
	text += "<td>Date UTC: " + row["Date UTC"] + "</td>";
	return text;
}

function formatText(rows)
{
	var response_text = "<table style='border-collapse:collapse'>"+
		"<thead><h2>Results</h2></thead><tbody>";
	for (var i = 0; i < rows.length; i++)
	{
		var next_text = "<tr style='border: solid black'>";
		next_text += formatHelper(rows[i]);
		next_text += "</tr>";
		response_text += next_text;
	}
	response_text += "</tbody></table>";
	return response_text;
}

function fixInput(kvs)
{
	var time = kvs["time"];
	time = time.replace("%3A", ":");
	kvs['time'] = time.replace("+", " ");

	kvs['temp'] = parseFloat(kvs['temp']);

	kvs['dew'] = parseFloat(kvs['dew']);

	kvs['humidity'] = parseInt(kvs['humidity']);

	kvs['pressure'] = parseFloat(kvs['pressure']);

	kvs['visibility'] = parseFloat(kvs['visibility']);

	kvs['gust'] = parseFloat(kvs['gust']);

	kvs['degrees'] = parseInt(kvs['degrees']);

	var date = kvs["date"];
	date = date.replace("+", " ");
	kvs['date'] = date.replace("%3A", ":");
	kvs['date'] = kvs['date'].replace("%3A", ":");

	kvs['abs_time'] = convertTime(kvs['time']);

	return kvs;
}

function convertTime(time)
{
	var hour = parseInt(time.match(/[^\:]+/)[0].trim());
	var minutes = parseInt(time.match(/[0-9]+\s/)[0].trim());
	var noon = time.match(/\s.+/)[0].trim();
	var in_minutes = minutes;
	if (hour === 12 && noon === "AM")
	{
		in_minutes += 0;
	}
	else if (noon === "AM")
	{
		in_minutes += hour*60;
	}
	else if (hour === 12 && noon == "PM")
	{
		in_minutes += 12*60;
	}
	if (noon === 'PM')
	{
		in_minutes += (hour+12)*60;
	}
	return in_minutes;
}

function addToDatabase(dict)
{
	// open the database
	try
	{
		var db = new sql.Database('weather.sqlite');
	}
	catch(exp)
	{
		console.log("Error: " + exp);
	}	

		var values = "(";
		
		values += "'" + dict['time'] + "',";
		values += dict['temp'] + ",";
		values += dict['dew'] + ",";
		values += dict['humidity'] + ",";
		values += dict['pressure'] + ",";
		values += dict['visibility'] + ",";
		values += "'" + dict['direction'] + "',";
		values += "'" + dict['speed'] + "',";
		values += "'" + dict['gust'] + "',";
		values += "'" + dict['precipitation'] + "',";
		values += "'" + dict['events'] + "',";
		values += "'" + dict['conditions'] + "',";
		values += dict['degrees'] + ",";
		values += "'" + dict['date'] + "',";
		values += dict['abs_time'] + ")";

		try
		{
			db.run("INSERT INTO Weather VALUES " + values);
		}
		catch(exp)
		{
			console.log("Error: " + exp);
		}
}

function server_run(req, res)
{
	var filename = "./" + req.url;
    try {
        var contents = fs.readFileSync( filename ).toString();
        res.writeHead( 200 );
        res.end( contents );
    }
    catch( exp ) {
    	if (req.url.indexOf("start_time") >= 0)
    	{
    		var kvs = getFormValuesFromURL( req.url );
    		var start = getTime(kvs['start_time']);
    		var end = getTime(kvs['end_time']);
    		if (end < start)
    		{
    			res.writeHead(200);
    			res.end("Enter a valid range of time.")
    		}
    		else
    		{
	    		var db = new sql.Database('weather.sqlite');
	    		db.all( "SELECT * FROM Weather",
	                kvs['abs_time'],
	                function( err, rows ) {
	                	if (err) {
	                		res.writeHead( 200 );
	                        res.end( "ERROR: " + err );
	                	}
	                	else {
	                    	res.writeHead(200);
	                    	var in_range = cull(rows, start, end);
	                    	var response_text = formatText(in_range);
	                    	res.end(response_text);
	                    }
	            });
    		}
    	}
    	else if (req.url.indexOf("add_row") >= 0)
    	{
    		var kvs = getFormValuesFromURL( req.url );
    		var contents = fixInput(kvs);
    		try
    		{
    			addToDatabase(contents);
    			res.writeHead(200);
    			res.end("New entry successful");
    		}
    		catch(exp)
    		{
    			res.writeHead(200);
    			res.end("Entry failed");
    		}
    	}
    	else
        {
            res.writeHead( 404 );
            res.end( "Cannot find file: "+filename );
        }
    }
}

var server = http.createServer( server_run );
server.listen( 8080 );