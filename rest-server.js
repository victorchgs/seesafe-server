import express from "express";
import coap from "coap";
import bodyParser from "body-parser";

const app = express();

app.use(bodyParser.json());

app.post("/proxy/lowVisionAuth", async (req, res) => {
  const { id } = req.body;

  const coapRequest = coap.request({
    hostname: "localhost",
    port: 5683,
    method: "POST",
    pathname: "/lowVisionAuth",
  });

  coapRequest.write(JSON.stringify({ id }));

  coapRequest.on("response", (coapResponse) => {
    const responsePayload = coapResponse.payload.toString();

    if (coapResponse.code !== "2.05") {
      return res.status(500).send({
        error: "Erro no servidor CoAP",
        details: responsePayload,
      });
    }

    res.status(200).send({
      message: "ID processado com sucesso pelo servidor CoAP",
      data: responsePayload,
    });
  });

  coapRequest.on("error", (error) => {
    console.error("Erro ao comunicar com o servidor CoAP:", error);
    res.status(500).send({ error: "Erro de comunicação com o servidor CoAP" });
  });

  coapRequest.end();
});

// Endpoint para proxy do CoAP
app.post("/proxy/sensorData", async (req, res) => {
  console.log("Mensagem: ", req.body);
  const { id, gyro: gyroscope, accel: accelerometer, distance, geolocation } = req.body;

  if (!id || !gyroscope || !accelerometer || !distance || !geolocation) {
    return res.status(400).send({
      error: "Payload inválido. Certifique-se de incluir ID, giroscópio, acelerômetro, distância e geolocalização válidos.",
    });
  }

  const coapRequest = coap.request({
    hostname: "localhost",
    port: 5683,
    method: "POST",
    pathname: "/sensorData",
  });

  // Monta o payload para o servidor CoAP
  const payload = {
    id,
    gyro: gyroscope,
    accel: accelerometer,
    distance,
    geolocation,
  };

  coapRequest.setOption("Content-Format", "application/json");
  coapRequest.write(JSON.stringify(payload));

  // Tratamento da resposta do servidor CoAP
  coapRequest.on("response", (coapResponse) => {
    const responsePayload = coapResponse.payload.toString();

    console.log("Resposta do servidor CoAP:", responsePayload);

    if (coapResponse.code !== "2.05") {
      return res.status(500).send({
        error: "Erro no servidor CoAP",
        details: responsePayload,
      });
    }
    
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responsePayload);
    } catch (error) {
      // Caso não seja JSON, envie a mensagem como texto
      return res.status(200).send({
        message: "Dados recebidos com sucesso do servidor CoAP",
        response: responsePayload,
      });
    }

    res.status(200).send({
      message: "Dados recebidos com sucesso do servidor CoAP",
      response: parsedResponse,
    });
  });

  // Tratamento de erro na comunicação com o servidor CoAP
  coapRequest.on("error", (error) => {
    console.error("Erro ao comunicar com o servidor CoAP:", error);
    res.status(500).send({ error: "Erro de comunicação com o servidor CoAP" });
  });

  coapRequest.end();
});


app.listen(3000, () => {
  console.log("Proxy rodando na porta 3000");
});
