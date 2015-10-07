var fs = require( 'fs' );
var http = require( 'http' );
var sql = require( 'sqlite3' ).verbose();

function cleanURL(string) {
    while (string.indexOf("+") >= 0) {
        string = string.replace("+", " ");
    }
    return string;
}

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

function addStudent( req, res )
{
    var kvs = getFormValuesFromURL( req.url );
    var db = new sql.Database( 'registrar.sqlite' );
    var name = cleanURL(kvs[ 'name' ]);
    var sandwich = cleanURL(kvs[ 'sandwich' ]);

    console.log(name, sandwich);
    db.run( "INSERT INTO Students(Name, SandwichPreference) VALUES ( ?, ? )", name, sandwich,
            function( err ) {
                if( err === null )
                {
                    res.writeHead( 200 );
                    res.end( "Added student" );
                }
                else
                {
                    console.log( err );
                    res.writeHead( 200 );
                    res.end( "FAILED" );
                }
            } );
}

function addTeacher(req, res) {
    var kvs = getFormValuesFromURL(req.url);
    var db = new sql.Database('registrar.sqlite');
    var name = cleanURL(kvs['name']);
    db.run("INSERT INTO Teachers(Name) VALUES(?)", name,
        function(err) {
            if (err === null) {
                res.writeHead(200);
                res.end("Added teacher");
            }
            else {
                console.log(err);
                res.writeHead(200);
                res.end("FAILED");
            }
        });
}

function addCourse(req, res) {
    var kvs = getFormValuesFromURL(req.url);
    var db = new sql.Database('registrar.sqlite');
    var name = cleanURL(kvs['name']);
    db.run("INSERT INTO Courses(Name) VALUES(?)", name,
        function(err) {
            if (err === null) {
                res.writeHead(200);
                res.end("Added course");
            }
            else {
                console.log(err);
                res.writeHead(200);
                res.end("FAILED");
            }
        });
}

function addEnrollment(req, res) {
    var kvs = getFormValuesFromURL(req.url);
    var db = new sql.Database('registrar.sqlite');
    var student = kvs['student'];
    var course = kvs['course'];

    db.run("INSERT INTO Enrollments(student, class) VALUES(?, ?)", student, course,
        function(err) {
            if (err === null) {
                res.writeHead(200);
                res.end("Added enrollment");
            }
            else {
                console.log(err);
                res.writeHead(200);
                res.end("FAILED");
            }
        });
}

function addAssignment(req, res) {
    var kvs = getFormValuesFromURL(req.url);
    var db = new sql.Database('registrar.sqlite');
    var teacher = kvs['teacher'];
    var course = kvs['course'];
    db.run("INSERT INTO TeachingAssignments(teacher, class) VALUES(?, ?)", teacher, course,
        function(err) {
            if (err === null) {
                res.writeHead(200);
                res.end("Added teaching assignment");
            }
            else {
                console.log(err);
                res.writeHead(200);
                res.end("FAILED");
            }
        });
}

function formatStudents(title, rows) {
    var text = "<html><style type='text/css'>td {border: solid}</style>"
    text += "<body><h1>"+title+"</h1><table>";
    for (var i = 0; i < rows.length; i++) {
        var dict = rows[i];
        var id = dict['sid'];
        var name = dict['Name'];
        var sandwich = dict['SandwichPreference'];
        text += "<tr><td>Name: "+name+"</td>";
        text += "<td> ID: "+id+"</td>";
        text += "<td> Sandwich Preference: "+sandwich+"</td></tr>"
    }
    text += "</table></body></html>";
    return text;
}

function getStudents(req, res) {
    var db = new sql.Database('registrar.sqlite');

    db.all( "SELECT * FROM Students",
        function( err, rows ) {
            if( err )
            {
                res.writeHead( 200 );
                res.end( "ERROR: " + err );
            }
            else
            {
                res.writeHead( 200 );
                var response_text = formatStudents("Students", rows);
                res.end( response_text );
            }
        } );
}

function formatTeachers(title, rows) {
    var text = "<html><style type='text/css'>td {border: solid}</style>"
    text += "<body><h1>"+title+"</h1><table>";
    for (var i = 0; i < rows.length; i++) {
        var dict = rows[i];
        var id = dict['tid'];
        var name = dict['Name'];
        text += "<tr><td>Name: "+name+"</td>";
        text += "<td> ID: "+id+"</td></tr>";
    }
    text += "</table></body></html>";
    return text;
}

function getTeachers(req, res) {
    var db = new sql.Database('registrar.sqlite');

    db.all( "SELECT * FROM Teachers",
        function( err, rows ) {
            if( err )
            {
                res.writeHead( 200 );
                res.end( "ERROR: " + err );
            }
            else
            {
                res.writeHead( 200 );
                var response_text = formatTeachers("Teachers", rows);
                res.end( response_text );
            }
        } );
}

function formatCourses(title, rows) {
    var text = "<html><style type='text/css'>td {border: solid}</style>"
    text += "<body><h1>"+title+"</h1><table>";
    for (var i = 0; i < rows.length; i++) {
        var dict = rows[i];
        var id = dict['cid'];
        var name = dict['Name'];
        text += "<tr><td>Name: "+name+"</td>";
        text += "<td> ID: "+id+"</td></tr>";
    }
    text += "</table></body></html>";
    return text;
}

function getCourses(req, res) {
    var db = new sql.Database('registrar.sqlite');

    db.all( "SELECT * FROM Courses",
        function( err, rows ) {
            if( err )
            {
                res.writeHead( 200 );
                res.end( "ERROR: " + err );
            }
            else
            {
                res.writeHead( 200 );
                var response_text = formatCourses("Courses", rows);
                res.end( response_text );
            }
        } );
}

function formatEnrollments(title, rows) {
    var text = "<html><style type='text/css'>td {border: solid}</style>"
    text += "<body><h1>"+title+"</h1><table>";
    for (var i = 0; i < rows.length; i++) {
        var dict = rows[i];
        var course = dict['CourseName'];
        var name = dict['Name'];
        text += "<tr><td>Course: "+course+"</td>";
        text += "<td> Student: "+name+"</td>";
    }
    text += "</table></body></html>";
    return text;
}

function getEnrollments(req, res) {
    var db = new sql.Database('registrar.sqlite');

    db.all( "SELECT * FROM Enrollments " +
        "JOIN Students ON Enrollments.student = Students.sid "+
        "JOIN Courses ON Enrollments.class = Courses.cid",
        function( err, rows ) {
            if( err )
            {
                res.writeHead( 200 );
                res.end( "ERROR: " + err );
            }
            else
            {
                res.writeHead( 200 );
                var response_text = formatEnrollments("Enrollments", rows);
                res.end( response_text );
            }
        } );
}

function formatAssignments(title, rows) {
    var text = "<html><style type='text/css'>td {border: solid}</style>"
    text += "<body><h1>"+title+"</h1><table>";
    for (var i = 0; i < rows.length; i++) {
        var dict = rows[i];
        var teacher = dict['TeacherName'];
        var course = dict['CourseName'];
        text += "<tr><td>Course: "+course+"</td>";
        text += "<td> Teacher: "+teacher+"</td>";
    }
    text += "</table></body></html>";
    return text;
}

function getAssignments(req, res) {
    var db = new sql.Database('registrar.sqlite');

    db.all( "SELECT * FROM TeachingAssignments " +
        "JOIN Teachers ON TeachingAssignments.teacher = Teachers.tid "+
        "JOIN Courses ON TeachingAssignments.class = Courses.cid",
        function( err, rows ) {
            if( err )
            {
                res.writeHead( 200 );
                res.end( "ERROR: " + err );
            }
            else
            {
                res.writeHead( 200 );
                var response_text = formatAssignments("Teaching Assignments", rows);
                res.end( response_text );
            }
        } );
}


function server_fun( req, res )
{
    //console.log( "The URL: '", req.url, "'" );
    // ...
    if( req.url === "/" || req.url === "/index.htm" )
    {
        req.url = "/index.html";
    }
    var filename = "./" + req.url;
    try {
        var contents = fs.readFileSync( filename ).toString();
        res.writeHead( 200 );
        res.end( contents );
    }
    catch( exp ) {
        if( req.url.indexOf( "add_student?" ) >= 0 )
        {
            addStudent( req, res );
        }
        else if( req.url.indexOf("add_teacher?") >= 0) {
            addTeacher(req, res);
        }
        else if( req.url.indexOf("add_course?") >= 0) {
            addCourse(req, res);
        }
        else if( req.url.indexOf("add_enrollment?") >= 0) {
            addEnrollment(req, res);
        }
        else if( req.url.indexOf("add_assignment?") >= 0) {
            addAssignment(req, res);
        }
        else if( req.url.indexOf("get_students") >= 0) {
            getStudents(req, res);
        }
        else if( req.url.indexOf("get_teachers") >= 0) {
            getTeachers(req, res);
        }
        else if( req.url.indexOf("get_courses") >= 0) {
            getCourses(req, res);
        }
        else if( req.url.indexOf("get_enrollments") >= 0) {
            getEnrollments(req, res);
        }
        else if( req.url.indexOf("get_assignments") >= 0) {
            getAssignments(req, res);
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
