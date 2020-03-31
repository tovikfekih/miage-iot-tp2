var path = require("path");

const config = require("./config");

const mqtt = require("mqtt");
const TOPIC_LIGHT = "sensors/light";
const TOPIC_TEMP = "sensors/temp";
const PING_ESP = "sensors/led";

const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "/")));
app.use(function(request, response, next) {
  response.header("Access-Control-Allow-Origin", "*");
  response.header("Access-Control-Allow-Headers", "*");
  response.header(
    "Access-Control-Allow-Methods",
    "POST, GET, OPTIONS, PUT, DELETE"
  );
  next();
});

var mongodb = require("mongodb");

const MongoClient = require("mongodb").MongoClient;
const client = new MongoClient(config.MONGO.SERVER_URI, {
  useNewUrlParser: true
});

client.connect(function(err, mongodbClient) {
  if (err) {
    throw err;
  }

  var dbo = client.db(config.MONGO.DATABASE);

  var client_mqtt = mqtt.connect(config.MQTT_SERVER_URI);

  client_mqtt.on("connect", function() {
    client_mqtt.subscribe(PING_ESP, function(err) {
      console.log("Il y est !!!!!");
      if (!err) {
        console.log("Node Server has subscribed to ", TOPIC_LIGHT);
      }
    });
    client_mqtt.subscribe(TOPIC_LIGHT, function(err) {
      if (!err) {
        console.log("Node Server has subscribed to ", TOPIC_LIGHT);
      }
    });
    client_mqtt.subscribe(TOPIC_TEMP, function(err) {
      if (!err) {
        console.log("Node Server has subscribed to ", TOPIC_TEMP);
      }
    });
  });

  client_mqtt.on("message", function(topic, message) {
    if (topic == PING_ESP) return;

    console.log("MQTT msg on topic : ", topic.toString());
    console.log("Msg payload : ", message.toString());
    try {
      message = JSON.parse(message);
    } catch (e) {
      cononsole.log("Le message n'est pas un json valable");
      return;
    }
    wh = message.who;
    val = message.value;

    let wholist = [];
    var index = wholist.findIndex(x => x.who == wh);
    if (index === -1) {
      wholist.push({ who: wh });
    }
    console.log("wholist using the node server :", wholist);

    var frTime = new Date();
    var new_entry = {
      date: frTime,
      who: wh,
      value: val
    };

    var topicname = path.parse(topic.toString()).base;

    key = topicname;
    dbo.collection(key).insertOne(new_entry, function(err, res) {
      if (err) throw err;
      console.log("Item inserted in db in collection :", key);
      console.log(new_entry);
    });

    dbo.listCollections().toArray(function(err, collInfos) {
      console.log("\nList of collections currently in DB: ", collInfos);
    });
  });

  process.on("exit", code => {
    if (mongodbClient && mongodbClient.isConnected()) {
      console.log("mongodb connection is going to be closed ! ");
      mongodbClient.close();
    }
  });
  app.get("/ping/:who/:state", function(req, res) {
    client_mqtt.publish(
      PING_ESP,
      JSON.stringify({
        who: req.params.who,
        state: req.params.state == "on" ? "on" : "off"
      })
    );
    res.json({
      success: true
    });
  });

  app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname + "/ui_lucioles.html"));
  });
  app.get("/users", (req, res) => {
    dbo
      .collection("users")
      .find({})
      .toArray((err, r) => {
        if (err) throw err;
        return res.json(r);
      });
  });
  app.post("/users", (req, res) => {
    console.log(req.body);
    const new_entry = {
      name: req.body.name,
      mac: req.body.mac
    };
    dbo.collection("users").insertOne(new_entry, function(err, r) {
      if (err) {
        return res.status(500).json({});
        throw err;
      }
      return res.status(200).json(new_entry);
    });
  });
  app.get("/esp/:who/:what", function(req, res) {
    console.log(req.originalUrl);

    wh = req.params.who;
    wa = req.params.what;

    console.log("\n--------------------------------");
    console.log("A client/navigator ", req.ip);
    console.log("sending URL ", req.originalUrl);
    console.log("wants to GET ", wa);
    console.log("values from object ", wh);

    const nb = 200;
    key = wa;
    dbo
      .collection(key)
      .find({ who: wh })
      .sort({ date: -1 })
      .limit(nb)
      .toArray(function(err, result) {
        if (err) throw err;
        console.log("get on ", key);
        console.log(result);
        res.json(result.reverse());
        console.log("end find");
      });
    console.log("end app.get");
  });
});

app.listen(config.PORT, () => {
  console.log(`Server listening on port ${config.PORT}`);
});
