// configuración del API RESTful
require("dotenv").config();
const express = require("express");
const app = express();
const port = 3000;

// configuración a la base de datos
const { MongoClient, ObjectId } = require("mongodb");
const uri = process.env.MONGODB_URI;

// Inicia la conexión a la base de datos
MongoClient.connect(uri)
  .then((client) => {
    console.log("Conectado a la base de datos");
    const database = client.db("tutorial10");

    // Utiliza el parser para objetos JSON
    app.use(express.json());

    // Retorna todos los sensores almacenados
    app.get("/sensores", (req, res) => {
      database
        .collection("sensores")
        .find()
        .toArray()
        .then((sensors) => res.status(200).send(sensors))
        .catch((error) => {
          console.error(error);
          res.status(500).send("Error interno del servidor");
        });
    });

    // Almacena un nuevo sensor
    app.post("/sensores", (req, res) => {
      let sensor = req.body;
      database
        .collection("sensores")
        .insertOne(sensor)
        .then(() => {
          console.log(sensor);
          res.status(201).send(sensor);
        })
        .catch((error) => {
          console.error(error);
          res.status(500).send("Error interno del servidor");
        });
    });

    // Retorna el sensor con el id pasado en el parámetro sensorId
    app.get("/sensores/:sensorId", (req, res) => {
      let sensorId = req.params.sensorId;
      if (!ObjectId.isValid(sensorId)) {
        return res.status(400).send("sensorId inválido");
      }
      database
        .collection("sensores")
        .findOne({ _id: new ObjectId(sensorId) })
        .then((sensor) => {
          if (sensor !== null) {
            res.status(200).send(sensor);
          } else {
            res.status(404).send(`El sensor con id: ${sensorId} no existe`);
          }
        })
        .catch((error) => {
          console.error(error);
          res.status(500).send("Error interno del servidor");
        });
    });

    // Almacena una nueva medición
    app.post("/sensores/:sensorId/mediciones", (req, res) => {
      let sensorId = req.params.sensorId;
      let measurement = req.body;
      if (!ObjectId.isValid(sensorId)) {
        return res.status(400).send("sensorId inválido");
      }

      database
        .collection("sensores")
        .updateOne(
          { _id: new ObjectId(sensorId) },
          { $addToSet: { mediciones: measurement } }
        )
        .then((result) => {
          if (result.matchedCount > 0) {
            res.status(201).send(measurement);
          } else {
            res.status(404).send(`El sensor con id: ${sensorId} no existe`);
          }
        })
        .catch((error) => {
          console.error(error);
          res.status(500).send("Error interno del servidor");
        });
    });

    // Inicializa el servidor para que escuche en el puerto determinado
    app.listen(port, () => {
      console.log(`Servidor escuchando en el puerto: ${port}`);
    });
  })
  .catch((error) => console.error("Error al conectar a la base de datos", error));