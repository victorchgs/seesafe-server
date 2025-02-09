import coap from "coap";

const SERVER_HOST = "localhost";
const SERVER_PORT = 5683;
const ENDPOINT = "/sensorsData";
// const DEVICE_ID = "id-1739017694234-nqwo0fux099";

async function sendCoapRequest(method, path, payload = null) {
  return new Promise((resolve, reject) => {
    const req = coap.request({
      hostname: SERVER_HOST,
      port: SERVER_PORT,
      method,
      pathname: path,
    });

    req.on("response", (res) => {
      let responseData = "";
      res.on("data", (chunk) => (responseData += chunk.toString()));
      res.on("end", () => {
        console.log(`🔹 Response (${res.code}):`, responseData);
        resolve({ status: res.code, data: responseData });
      });
    });

    req.on("error", (err) => {
      console.error("❌ Erro na requisição:", err.message);
      reject(err);
    });

    if (payload) {
      req.write(JSON.stringify(payload));
    }

    req.end();
  });
}

// Teste envio de dados
// Função para dividir um objeto JSON em partes menores
function chunkPayload(payload, chunkSize) {
  const jsonString = JSON.stringify(payload);
  const chunks = [];

  for (let i = 0; i < jsonString.length; i += chunkSize) {
    chunks.push(jsonString.substring(i, i + chunkSize));
  }

  return chunks;
}

async function testValidPrediction() {
  console.log("\nPredição com dados válidos");

  const deviceId = "id-1739017694234-nqwo0fux099";
    const payload = {
      accelerometerData: [
        {
          x: 0,
          y: 0,
          z: 1.000340461730957,
          timestamp: 56266.2362884
        },
        {
          x: 0.02,
          y: -0.01,
          z: 1.001,
          timestamp: 56266.3362885
        },
        {
          x: -0.03,
          y: 0.02,
          z: 1.003,
          timestamp: 56266.4362886
        },
        {
          x: 0.01,
          y: -0.01,
          z: 1.0045,
          timestamp: 56266.5362887
        },
        {
          x: -0.02,
          y: 0.03,
          z: 1.007,
          timestamp: 56266.6372880
        },
        {
          x: 0,
          y: -0.02,
          z: 1.010,
          timestamp: 56266.7372881
        },
        {
          x: 0.02,
          y: 0.01,
          z: 1.012,
          timestamp: 56266.8372882
        },
        {
          x: -0.01,
          y: -0.03,
          z: 1.0145,
          timestamp: 56266.9372884
        },
        {
          x: 0.01,
          y: 0.02,
          z: 1.016,
          timestamp: 56267.0372885
        },
        {
          x: -0.01,
          y: 0.01,
          z: 1.018,
          timestamp: 56267.1372886
        },
        {
          x: 0.03,
          y: -0.02,
          z: 1.02,
          timestamp: 56267.2372887
        },
        {
          x: -0.02,
          y: 0.02,
          z: 1.022,
          timestamp: 56267.3372888
        }
      ],
      gyroscopeData: [
        {
          x: 0,
          y: 0,
          z: 0,
          timestamp: 56266.22490394
        },
        {
          x: 0.01,
          y: -0.01,
          z: 0.02,
          timestamp: 56266.33490395
        },
        {
          x: -0.02,
          y: 0.01,
          z: -0.02,
          timestamp: 56266.44490396
        },
        {
          x: 0.03,
          y: -0.01,
          z: 0.01,
          timestamp: 56266.55490397
        },
        {
          x: -0.01,
          y: 0.02,
          z: -0.01,
          timestamp: 56266.66490400
        },
        {
          x: 0,
          y: -0.01,
          z: 0,
          timestamp: 56266.77490401
        },
        {
          x: 0.01,
          y: 0.01,
          z: -0.02,
          timestamp: 56266.88490402
        },
        {
          x: -0.02,
          y: -0.01,
          z: 0.01,
          timestamp: 56266.99490403
        },
        {
          x: 0.02,
          y: 0.02,
          z: -0.01,
          timestamp: 56267.10490404
        },
        {
          x: -0.01,
          y: -0.02,
          z: 0.02,
          timestamp: 56267.21490405
        },
        {
          x: 0.03,
          y: 0.01,
          z: -0.03,
          timestamp: 56267.32490406
        },
        {
          x: -0.02,
          y: 0.03,
          z: 0.01,
          timestamp: 56267.43490407
        }
      ],
      locationData: {
        timestamp: 1739035981882,
        mocked: false,
        coords: {
          altitude: 0,
          heading: 0,
          altitudeAccuracy: 0.5,
          latitude: 40.7579733,
          speed: 0,
          longitude: -73.9855417,
          accuracy: 5
        }
      },
      timestamp: "2025-02-08T17:33:04.269Z"
    };
  
  // Divide o payload em chunks de até 200 caracteres
  const chunkSize = 200;
  const chunks = chunkPayload(payload, chunkSize);
  const totalChunks = chunks.length;

  for (let i = 0; i < totalChunks; i++) {
    const chunkData = {
      deviceId,
      chunk: chunks[i],
      index: i,
      totalChunks
    };

    console.log(`Enviando chunk ${i + 1}/${totalChunks}...`);
    sendCoapRequest("POST", ENDPOINT, chunkData);
  }
}

async function testGetSensorsData() {
  console.log("\n🔹 Testando obtenção de dados do sensor via CoAP...");
  const deviceId = "id-1739017694234-nqwo0fux099";
  try {
    const chunkData = {
      deviceId,
    };
    const response = await sendCoapRequest("GET", `/sensorsData?deviceId=${deviceId}`);

    if (!response || !response.data) {
      console.error("❌ Erro: Resposta vazia ou inválida.");
      return;
    }

    const responseData = JSON.parse(response.data);
    console.log("\n✅ Resposta do Servidor:", responseData);

    // Verificando o estado da predição de queda
    const didFall = responseData.body?.data?.didFall;
    if (didFall) {
      console.log("⚠️ Queda detectada!");
    } else {
      console.log("✅ Nenhuma queda detectada.");
    }
  } catch (error) {
    console.error("❌ Erro ao obter dados do sensor:", error.message);
  }
}

// testValidPrediction();
testGetSensorsData();