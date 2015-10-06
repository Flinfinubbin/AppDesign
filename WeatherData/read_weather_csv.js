var fs = require("fs");
var sql = require( 'sqlite3' ).verbose();

// get the weather data from file
try
{
	// ignore first entry in array, as it's the label information
	var contents = fs.readFileSync("weather_data.csv").toString().split("\n");
}
catch(exp)
{
	console.log("Error: " + exp +" Couldn't read file");
}

// all the keys for database entries, in sequence
var keys = ['time', 'temp', 'dew', 'humidity', 'pressure', 'visiblity', 'direction',
	'speed', 'gust', 'precip', 'event', 'condition', 'degrees', 'date'];

// makes a dictionary for every line of the array
function splitLines()
{
	var dicts = [];
	for (var i = 1; i < contents.length; i++)
	{
		var infos = {};
		// split the current line by commas
		var line = contents[i].split(',');

		// put every piece of information into a dictionary with key as defined in array
		for (var j = 0; j < line.length; j++)
		{
			// add an extra entry for the time in minutes, for searching purposes
			if (j === 0) {
				
				infos['abs_time'] = convertTime(line[0]);
			}
			// remove extra character from last entry
			if (j === line.length-1 && i !== contents.length-1)
			{
				var piece = line[j].slice(0,-2);
				infos[keys[j]] = piece;
			}
			else
			{
				infos[keys[j]] = line[j];
			}
		}
		dicts.push(infos);
	}
	return dicts
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

function addToDatabase(dicts)
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

	// for each dictionary representing a line
	for (var i = 0; i < dicts.length; i++) {
		// for each entry in each dictionary, add the value
		var current_dict = dicts[i];
		var values = "(";
		
		values += "'" + current_dict[keys[0]] + "',";
		values += current_dict[keys[1]] + ",";
		values += current_dict[keys[2]] + ",";
		values += current_dict[keys[3]] + ",";
		values += current_dict[keys[4]] + ",";
		values += current_dict[keys[5]] + ",";
		values += "'" + current_dict[keys[6]] + "',";
		values += "'" + current_dict[keys[7]] + "',";
		values += "'" + current_dict[keys[8]] + "',";
		values += "'" + current_dict[keys[9]] + "',";
		values += "'" + current_dict[keys[10]] + "',";
		values += "'" + current_dict[keys[11]] + "',";
		values += current_dict[keys[12]] + ",";
		values += "'" + current_dict[keys[13]] + "',";
		values += current_dict['abs_time'];
		values += ")";

		try
		{
			db.run("INSERT INTO Weather VALUES " + values);
		}
		catch(exp)
		{
			console.log("Error: " + exp);
		}
	}
}

var all = splitLines();
addToDatabase(all);