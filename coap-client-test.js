import * as coap from "coap";

// Teste de autenticação de usuário com CoAP
// const payload = JSON.stringify({
//   id: "id-1733937352777-0.fun2s1vxo3", 
// });

// Teste de envio de dados de sensores com CoAP
const payload = JSON.stringify({
  id: "id-1733937579625-0.iieynhg88z", // ID do usuário
  gyro: { x: 0.1, y: -0.2, z: 0.3 }, // Dados do giroscópio
  accel: { x: 9.8, y: 0.0, z: -9.8 }, // Dados do acelerômetro
  distance: 2.5, // Distância do objeto em metros
  geolocation: { lat: -23.55052, lng: -46.633308 }, // Localização do usuário
});

const req = coap.request({
    hostname: "localhost",
    port: 5683,
    method: "POST",
    pathname: "/sensorData",
});

console.log(payload);

req.setOption("Content-Format", "application/json");

console.log("Enviando requisição CoAP para o servidor...");
req.write(payload); // Envia o payload com os dados do usuário

req.on("response", (coapResponse) => {
    console.log("Recebeu resposta do servidor CoAP");
    const responsePayload = coapResponse.payload.toString();

    if (coapResponse.code !== "2.05") {
      console.log("Erro no servidor CoAP:", responsePayload);
  
    }
    console.log("ID processado com sucesso pelo servidor CoAP:", responsePayload);

  });

req.end();