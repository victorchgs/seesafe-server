import coap from "coap";
import fs from "fs";

const devicesPath = "./data/devices.json";
const sensorDataPath = "./data/sensorData.json";
const usersPath = "./data/users.json";

function generateUniqueId() {
  return `id-${Date.now()}-${Math.random().toString(36)}`;
}

function loadDevices() {
  try {
    const data = fs.readFileSync(devicesPath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.warn("Arquivo não encontrado. Criando novo arquivo.");
      return [];
    }
    throw err;
  }
}

function validateDeviceId(id, callback) {
  fs.readFile(devicesPath, (err, data) => {
    if (err) {
      console.error("Erro ao ler o arquivo de dispositivos:", err);
      return callback(false);
    }

    let devices = [];

    try {
      devices = JSON.parse(data);
    } catch (parseError) {
      console.error("Erro ao processar o JSON de dispositivos:", parseError);
      return callback(false);
    }

    const deviceExists = devices.some((device) => device.id === id);
    callback(deviceExists);
  });
}

function saveDevices(devices) {
  fs.writeFileSync(devicesPath, JSON.stringify(devices, null, 2), "utf8");
}

function saveSensorData(id, sensorData) {
  fs.readFile(sensorDataPath, (err, data) => {
    let allSensorData = [];

    if (!err) {
      try {
        allSensorData = JSON.parse(data);
      } catch (parseError) {
        console.error(
          "Erro ao processar o JSON de dados de sensores:",
          parseError
        );
      }
    }

    const userData = allSensorData.find((entry) => entry.id === id);
    if (userData) {
      userData.sensorReadings.push({
        ...sensorData,
        timestamp: new Date().toISOString(),
      });
    } else {
      allSensorData.push({
        id,
        sensorReadings: [
          {
            ...sensorData,
            timestamp: new Date().toISOString(),
          },
        ],
      });
    }

    fs.writeFile(
      sensorDataPath,
      JSON.stringify(allSensorData, null, 2),
      (err) => {
        if (err) {
          console.error("Erro ao salvar dados do sensor no arquivo:", err);
        } else {
          console.log("Dados do sensor armazenados com sucesso.");
        }
      }
    );
  });
}

function handlePostAuth(req, res) {
  const payload = req.payload?.toString();

  try {
    const data = JSON.parse(payload);
    let deviceId = data.deviceId;

    const devices = loadDevices();

    if (deviceId) {
      console.log("ID recebido:", deviceId);
      const device = devices.find((device) => device.id === deviceId);

      if (device) {
        device.lastAccessed = new Date().toISOString();
        console.log(`Último acesso atualizado para o ID: ${deviceId}`);
      } else {
        console.log("ID não encontrado. Gerando novo ID...");
        deviceId = generateUniqueId();
        devices.push({
          id: deviceId,
          createdAt: new Date().toISOString(),
          lastAccessed: new Date().toISOString(),
          status: "active",
        });
      }
    } else {
      console.log("ID vazio. Gerando novo ID...");
      deviceId = generateUniqueId();
      devices.push({
        id: deviceId,
        createdAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        status: "active",
      });
    }

    saveDevices(devices);

    res.code = "2.05";
    res.end(
      JSON.stringify({
        message: "Dispositivo autenticado com sucesso",
        data: { deviceId },
      })
    );
  } catch (error) {
    console.error("Erro ao processar o payload:", error.message);
    res.code = "4.00";
    res.end(
      JSON.stringify({
        error: "Erro ao processar o payload",
        details: error.message,
      })
    );
  }
} // TODO: Colocar os handles em uma pasta separada

function handlePostSensorData(req, res) {
  const payload = req.payload?.toString();

  try {
    const data = JSON.parse(payload);
    const {
      deviceId,
      gyro: gyroscope,
      accel: accelerometer,
      distance,
      geolocation,
    } = data;

    if (
      !deviceId ||
      !gyroscope ||
      !accelerometer ||
      distance === undefined ||
      !geolocation
    ) {
      res.code = "4.00";
      return res.end(
        JSON.stringify({
          error: "Payload inválido",
          message: "Dados com formato inválido.",
        })
      );
    }

    validateDeviceId(id, (isValid) => {
      if (!isValid) {
        res.code = "4.01";
        return res.end(
          JSON.stringify({
            error: "ID inválido ou não autenticado",
          })
        );
      }

      const sensorData = { gyroscope, accelerometer, distance, geolocation };
      saveSensorData(deviceId, sensorData);

      res.code = "2.05";
      res.end(
        JSON.stringify({
          message: "Dados do sensor recebidos com sucesso.",
          data: {
            deviceId,
            sensorData,
          },
        })
      );
    });
  } catch (error) {
    console.error("Erro ao processar o payload:", error);

    res.code = "4.00";
    res.end(
      JSON.stringify({
        error: "Erro ao processar o payload",
      })
    );
  }
} // TODO: Colocar os handles em uma pasta separada

const routes = {
  "/deviceAuth": {
    GET: (req, res) => {
      res.code = "4.04";
      res.end("GET deviceAuth");
    },
    POST: handlePostAuth,
  },
  "/sensorData": {
    GET: (req, res) => {
      res.code = "2.05";
      res.end("Sensor data");
    },
    POST: handlePostSensorData,
  },
};

function routeHandler(req, res) {
  const { url, method } = req;

  if (!url || !method) {
    res.code = "4.0";
    return res.end("URL ou método inválido");
  }

  const resource = routes[url];

  if (resource && resource[method]) {
    return resource[method](req, res);
  }

  res.code = "4.04";
  res.end("Recurso não encontrado");
}

const server = coap.createServer();

server.on("request", routeHandler);

server.listen(5683, () => {
  console.log("Servidor CoAP executando na porta 5683");
});
