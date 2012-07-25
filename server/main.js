// object store and retiever
// to start the server >node ./server/main.js 8098
var express = require('express'),
    app = express.createServer(express.bodyParser()),
    db = require('mongous').Mongous,
    Oid = require("mongous/bson/bson.js").ObjectID,
    _ = require("./catalyst_merge"),
    g_connected = false,
    g_connect_retry = 3;

// Delay before tring to test the database connection
// ...some servers have had problems in making a connection to mongodb
setTimeout(function() {
    var intervalID = setInterval(function() {
        if (!g_connected && g_connect_retry>0) {
            console.log("db: no responce from mongodb after 5 seconds");
            console.log("db: retesting connection");
            g_connect_retry -= 1;
            db('ac.catalyst').find(1, function (reply) {
                g_connected = true;
                console.log("db: connection made");
            });
        }
        else {
            clearInterval(intervalID);
            if (g_connect_retry <= 0) {
                console.log("Exiting: db connection retries have expired");
                process.exit(1);
            }
            console.log("db: you're good to go");
        }
    }, 5000);
    console.log("db: testing connection to mongodb");
    db('ac.catalyst').find(1, function (reply) {
        g_connected = true;
        console.log("db: connection made");
    });    
}, 3000);

app.configure(function() {
    app.use(express.static(__dirname + '/client'));
});

app.listen(process.argv[2]);

// services...
// get...
// usage domain/catalyst?finder={"some_property":{"$eq":"some_value"}}&size=10
app.get('/catalyst', function (req, res) {
    var req_finder = req.query.finder || '{}';
    var finder = JSON.parse(req_finder);
    var req_size = req.query.size || '1';
    var size = parseInt(req_size, 10);
    var req_count = req.query.count || '';
    var req_return_as = req.query.return_as || '{"format":"JSON"}';
    var return_as = JSON.parse(req_return_as);
    console.log("get /catalyst");
    if (finder._id && finder._id.length == 24) {
        finder._id = new Oid(finder._id);
    }
    if (req_count !== '') {
        db('ac.catalyst').find(size, finder, function (reply) {
            if (return_as.format == "JSON") {
                res.contentType('application/json; charset=utf-8');
                res.send(reply);
            }
            if (return_as.format == "JSONP") {
                res.contentType('application/javascript; charset=utf-8');
                res.send("callback("+reply+");");
            }
        });
    }
    else { // return a count
        db('ac.catalyst').find(finder, function (reply) {
            if (return_as.format == "JSON") {
                res.contentType('application/json; charset=utf-8');
                res.send(reply.length);
            }
            if (return_as.format == "JSONP") {
                res.contentType('application/javascript; charset=utf-8');
                res.send("callback("+reply.length+");");
            }
        });
    }
});

// post... 
// usage domain/catalyst/ POST:json={"intent":"insert", "content":{"prop":"value"}}
app.post('/catalyst', function (req, res) {
    var envelope = JSON.parse(req.body.json);
    var content = envelope.content;
    var _id;
    console.log('post /catalyst '+JSON.stringify(req.body.json, null, " "));
    if (envelope.intent == "update") {
        if ((envelope._id && envelope._id.length == 24) || (content._id && content._id.length == 24)) { 
            _id = envelope._id || content._id;
            db('ac.catalyst').update({"_id":Oid(_id)}, content);
        }
        else {
            db('ac.catalyst').update(envelope.finder, content);
        }
    }
    if (envelope.intent == "insert") {
        if ((envelope._id && envelope._id.length == 24) || (content._id && content._id.length == 24)) { 
            _id = envelope._id || content._id;
            // delete content._id first...
            content = _.merge({"_id":Oid(_id)}, content);
        }
        db('ac.catalyst').insert(content);
    }
    if (envelope.intent == "remove") {
        db('ac.catalyst').remove(content);
    }
    res.contentType('application/json');
    res.send({"result":"success"});
});


