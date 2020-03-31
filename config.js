module.exports = {
  MQTT_SERVER_URI: "http://broker.hivemq.com",
  PORT: 9000,
  MONGO: {
    SERVER_URI: "mongodb://localhost:27017/test?retryWrites=true&w=majority",
    DATABASE: "lucioles",
    COLLECTION: "test"
  }
};
