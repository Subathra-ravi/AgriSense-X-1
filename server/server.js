const express = require("express");
const path = require("path");
const mqtt = require("mqtt");


const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public")));

// ✅ MQTT setup
const client = mqtt.connect("mqtt://broker.hivemq.com");

client.on("connect", () => {
  console.log("✅ MQTT Connected");

  // ✅ Subscribe topics
  client.subscribe("agrisensex/sensor/1");
  client.subscribe("agrisensex/motor/1/status");
});

// ✅ Store data
let sensorData = { voltage: 0, current: 0 };
let motorStatus = "OFF";

// ✅ Handle ALL MQTT messages in ONE place
client.on("message", (topic, message) => {
  const msg = message.toString();

  if (topic === "agrisensex/sensor/1") {
    try {
      sensorData = JSON.parse(msg);
    } catch (e) {
      console.error("Sensor JSON error");
    }
  }

  if (topic === "agrisensex/motor/1/status") {
    motorStatus = msg;
  }
});

// ✅ APIs
app.get("/api/sensor", (req, res) => {
  res.json(sensorData);
});

app.get("/api/motor-status", (req, res) => {
  res.json({ status: motorStatus });
});



app.post("/api/motor", (req, res) => {
  const { motor, state } = req.body;

  // ✅ Correct command topic
  const cmdTopic = `agrisensex/motor/${motor}/cmd`;
  client.publish(cmdTopic, state);

  res.json({ success: true, motor, state });
});

// ✅ Page routes
app.get("/", (req, res) =>
  res.sendFile(path.join(__dirname, "../public/index.html"))
);

app.get("/home", (req, res) =>
  res.sendFile(path.join(__dirname, "../public/home.html"))
);

app.get("/add-device", (req, res) =>
  res.sendFile(path.join(__dirname, "../public/add-device.html"))
);

app.get("/monitor", (req, res) =>
  res.sendFile(path.join(__dirname, "../public/monitor.html"))
);

app.get("/motor1", (req, res) =>
  res.sendFile(path.join(__dirname, "../public/motor1.html"))
);

app.get("/motor2", (req, res) =>
  res.sendFile(path.join(__dirname, "../public/motor2.html"))
);

app.get("/motor3", (req, res) =>
  res.sendFile(path.join(__dirname, "../public/motor3.html"))
);

app.get("/motor4", (req, res) =>
  res.sendFile(path.join(__dirname, "../public/motor4.html"))
);

// ✅ Start server
app.listen(3000, () => {
  console.log("✅ Server running on http://localhost:3000");
});
