var path = require("path");

const config = require("./config");

const mqtt = require("mqtt");
const TOPIC_LIGHT = "sensors/light";
const TOPIC_TEMP = "sensors/temp";
const PING_ESP = "sensors/led";
const TOPIC_LED_OK = "sensors/led_ok";

const express = require("express");
const bodyParser = require("body-parser");

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/", express.static(path.join(__dirname, "/client/dist")));
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
    client_mqtt.subscribe(TOPIC_LED_OK, function(err) {
      if (!err) {
        console.log("Node Server has subscribed to ", TOPIC_LED_OK);
      }
    });
  });

  client_mqtt.on("message", function(topic, message) {
    console.log("MQTT msg on topic : ", topic.toString());
    console.log("Msg payload : ", message.toString());
    if (topic == PING_ESP) return;
    if (topic == TOPIC_LED_OK) {
      message = JSON.parse(message);
      dbo
        .collection("users")
        .updateOne({ mac: message.who }, { $set: { led_ok: new Date() } });
      return;
    }

    try {
      message = JSON.parse(message);
    } catch (e) {
      return;
    }
    wh = message.who;
    val = message.value;

    let wholist = [];
    var index = wholist.findIndex(x => x.who == wh);
    if (index === -1) {
      wholist.push({ who: wh });
    }
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
    });

    dbo.listCollections().toArray(function(err, collInfos) {});
  });

  process.on("exit", code => {
    if (mongodbClient && mongodbClient.isConnected()) {
      console.log("mongodb connection is going to be closed ! ");
      mongodbClient.close();
    }
  });
  app.get("/ping/:who/:state", function(req, res) {
    client_mqtt.publish(PING_ESP, req.params.who);
    res.json({
      success: true
    });
  });

  app.get("/", function(req, res) {
    res.sendFile(path.join(__dirname + "/client/dist/index.html"));
  });
  app.get("/users", (req, res) => {
    dbo
      .collection("users")
      .find({})
      .sort({ _id: -1 })
      .limit(100)
      .toArray((err, r) => {
        if (err) throw err;
        return res.json(r);
      });
  });
  app.post("/users", (req, res) => {
    const new_entry = {
      name: req.body.name,
      mac: req.body.mac,
      createdAt: new Date()
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
    wh = req.params.who;
    wa = req.params.what;

    const nb = 200;
    key = wa;
    dbo
      .collection(key)
      .find({ who: wh })
      .sort({ _id: -1 })
      .limit(100)
      .toArray(function(err, result) {
        if (err) throw err;
        res.json(result.reverse());
      });
  });
});

app.listen(config.PORT, () => {
  console.log(`Server listening on port ${config.PORT}`);
});
