import * as coap from "coap";
import fs from "fs";

const lowVisionUsersPath = "./data/lowVisionUsers.json";
const sensorDataPath = "./data/sensorData.json";

function generateUniqueId() {
  return `id-${Date.now()}-${Math.random().toString(36)}`;
}

// Função para carregar usuários do arquivo JSON
function loadUsers() {
  try {
    const data = fs.readFileSync(lowVisionUsersPath, "utf8");
    return JSON.parse(data);
  } catch (err) {
    if (err.code === "ENOENT") {
      // Arquivo não existe, inicializar vazio
      console.warn("Arquivo não encontrado. Criando novo arquivo.");
      return [];
    }
    throw err;
  }
}

// Função para salvar usuários no arquivo JSON
function saveUsers(users) {
  fs.writeFileSync(lowVisionUsersPath, JSON.stringify(users, null, 2), "utf8");
}

// Função para salvar dados do sensor
function saveSensorData(id, sensorData) {
  fs.readFile(sensorDataPath, (err, data) => {
    let allSensorData = [];

    if (!err) {
      try {
        allSensorData = JSON.parse(data);
      } catch (parseError) {
        console.error("Erro ao processar o JSON de dados de sensores:", parseError);
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

    fs.writeFile(sensorDataPath, JSON.stringify(allSensorData, null, 2), (err) => {
      if (err) {
        console.error("Erro ao salvar dados do sensor no arquivo:", err);
      } else {
        console.log("Dados do sensor armazenados com sucesso.");
      }
    });
  });
}

// Rota POST para /sensorData
function heandlePostSensorData(req, res) {
  const payload = req.payload?.toString();

  try {
    const data = JSON.parse(payload);
    const { id, gyro: gyroscope, accel: accelerometer, distance, geolocation} = data;

    if (!id || !gyroscope || !accelerometer || distance === undefined || !geolocation) {
      res.code = "4.00";
      return res.end("Payload inválido. Dados com formato inválido.");
    }

    validateUserId(id, (isValid) => {
      if (!isValid) {
        res.code = "4.01";
        return res.end("ID inválido ou não autenticado.");
      }

      const sensorData = { gyroscope, accelerometer, distance, geolocation};
      saveSensorData(id, sensorData);

      res.code = "2.05";
      res.end("Dados do sensor recebidos com sucesso.");
    });
  } catch (error) {
    console.error("Erro ao processar o payload:", error);

    res.code = "4.00";
    res.end("Erro ao processar o payload");
  }
}

// Rota POST para /lowVisionAuth
function handlePostAuth(req, res) {
  const payload = req.payload?.toString();

  try {
    const data = JSON.parse(payload);
    let id = data.id;

    // Carrega os usuários existentes
    const users = loadUsers();

    if (id) {
      console.log("ID recebido:", id);
      const user = users.find((user) => user.id === id);

      if (user) {
        // Atualizar o último acesso
        user.lastAccessed = new Date().toISOString();
        console.log(`Último acesso atualizado para o ID: ${id}`);
      } else {
        console.log("ID não encontrado. Gerando novo ID...");
        id = generateUniqueId();
        users.push({
          id,
          createdAt: new Date().toISOString(),
          lastAccessed: new Date().toISOString(),
          status: "active",
        });
      }
    } else {
      console.log("ID vazio. Gerando novo ID...");
      id = generateUniqueId();
      users.push({
        id,
        createdAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        status: "active",
      });
    }

    // Salva os usuários atualizados
    saveUsers(users);

    // Responde com o ID atualizado ou criado
    res.code = "2.05";
    res.end(JSON.stringify({ id }));
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
}

function validateUserId(id, callback) {
  fs.readFile(lowVisionUsersPath, (err, data) => {
    if (err) {
      console.error("Erro ao ler o arquivo de usuários:", err);
      return callback(false);
    }

    let users = [];
    try {
      users = JSON.parse(data);
    } catch (parseError) {
      console.error("Erro ao processar o JSON de usuários:", parseError);
      return callback(false);
    }

    const userExists = users.some((user) => user.id === id);
    callback(userExists);
  });
}

// Configuração das rotas
const routes = {
  "/lowVisionAuth": {
    GET: (req, res) => {
      res.code = "4.04";
      res.end("Recurso não encontrado");
    },
    POST: handlePostAuth,
  },
  "/sensorData": {
    GET:(req, res) =>{
      res.code = "2.05";
      res.end("Sensor data");
    },
    POST: heandlePostSensorData,
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

server.listen(5683, "0.0.0.0", () => {
  console.log("Servidor CoAP iniciado na porta 5683...");
});
