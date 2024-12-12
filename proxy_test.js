import axios from "axios";

// JSON que será enviado
const testPayload = {
  id: "id-1733937352777-0.fun2s1vxo3",
  gyro: { x: 0.1, y: -0.2, z: 0.3 },
  accel: { x: 9.8, y: 0, z: -9.8 },
  distance: 2.5,
  geolocation: { lat: -23.55052, lng: -46.633308 },
};

// URL do proxy
const proxyUrl = "http://localhost:3000/proxy/sensorData";

// Função para testar o proxy
async function testProxy() {
  try {
    console.log("Enviando dados para o proxy...");
    const response = await axios.post(proxyUrl, testPayload, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("Resposta do proxy:");
    console.log(response.data);
  } catch (error) {
    console.error("Erro ao comunicar com o proxy:");
    if (error.response) {
      // Resposta do servidor com erro
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      // Erro de conexão ou outro problema
      console.error(error.message);
    }
  }
}

// Executar a função de teste
testProxy();
