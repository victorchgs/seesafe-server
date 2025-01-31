// import coap from "coap";

// function sendCoapRequest(method, path, payload = null) {
//   const req = coap.request({
//     hostname: "localhost",
//     port: 5683,
//     method,
//     pathname: path,
//   });

//   req.on("response", (res) => {
//     console.log(`Response: ${res.code}`);
//     res.pipe(process.stdout);
//   });

//   if (payload) {
//     req.write(JSON.stringify(payload));
//   }

//   req.end();
// }

// // Testando cada rota
// sendCoapRequest("POST", "/deviceAuth", { deviceId: "123" });
// sendCoapRequest("GET", "/sensorsDataCapture");
// sendCoapRequest("POST", "/predictFall", { sensorData: [1.2, 3.4, 5.6] });

import coap from "coap";

const SERVER_HOST = "localhost";
const SERVER_PORT = 5683;
const ENDPOINT = "/predictFall";

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

// 🟢 Teste 1: Enviar dados válidos para predição
async function testValidPrediction() {
  console.log("\n🟢 Teste 1: Predição com dados válidos");
  await sendCoapRequest("POST", ENDPOINT, 
    {
      "acc_x": [0.5, 0.6, 0.7],
      "acc_y": [1.2, 1.3, 1.4],
      "acc_z": [9.8, 9.9, 10.0],
      "gyro_x": [0.03, 0.05, 0.06],
      "gyro_y": [-0.02, -0.01, 0.0],
      "gyro_z": [0.01, 0.02, 0.03]
    }
    
  );
}

// 🔴 Teste 2: Enviar dados incompletos (deve retornar erro 4.00)
async function testIncompleteData() {
  console.log("\n🔴 Teste 2: Predição com dados incompletos");
  await sendCoapRequest("POST", ENDPOINT, {
    acc_x: 0.5,
    acc_y: 1.2,
    acc_z: 9.8,
    // gyro_x ausente!
    gyro_y: -0.02,
    gyro_z: 0.01,
  });
}

// 🟡 Teste 3: Testar um método inválido (GET não suportado)
async function testInvalidMethod() {
  console.log("\n🟡 Teste 3: Método inválido (GET)");
  await sendCoapRequest("GET", ENDPOINT);
}

// 🔵 Teste 4: Enviar JSON malformado
async function testMalformedJSON() {
  console.log("\n🔵 Teste 4: JSON malformado");
  const req = coap.request({
    hostname: SERVER_HOST,
    port: SERVER_PORT,
    method: "POST",
    pathname: ENDPOINT,
  });

  req.on("response", (res) => {
    let responseData = "";
    res.on("data", (chunk) => (responseData += chunk.toString()));
    res.on("end", () => {
      console.log(`🔹 Response (${res.code}):`, responseData);
    });
  });

  req.on("error", (err) => {
    console.error("❌ Erro na requisição:", err.message);
  });

  req.write('{"acc_x": 0.5, "gyro_x": }'); // JSON malformado!
  req.end();
}

// 🚀 Executar os testes em sequência
async function runTests() {
  console.log("🚀 Iniciando testes de predição...\n");
  await testValidPrediction();
  // await testIncompleteData();
  // await testInvalidMethod();
  // await testMalformedJSON();
}

runTests();
