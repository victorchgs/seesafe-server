import express from "express";
import coap from "coap";
import bodyParser from "body-parser";

const app = express();

app.use(bodyParser.json({ limit: "10mb" }));

function createCoapRequest(method, pathname) {
  return coap.request({
    hostname: "localhost",
    port: 5683,
    method: method,
    pathname: pathname,
  });
}

app.post("/proxy/deviceAuth", async (req, res) => {
  const { deviceId } = req.body;

  const coapRequest = createCoapRequest("POST", "/deviceAuth");

  coapRequest.write(JSON.stringify({ deviceId }));

  coapRequest.on("response", (coapResponse) => {
    const responsePayload = coapResponse.payload.toString();

    if (coapResponse.code !== "2.05") {
      return res.status(500).json({
        error: "Erro no servidor CoAP",
        details: responsePayload,
      });
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responsePayload);
    } catch (error) {
      return res.status(500).json({
        error: "Erro ao processar a resposta do servidor CoAP",
        details: error.message,
      });
    }

    res.status(200).json({
      message: "deviceId processado com sucesso pelo servidor CoAP",
      data: parsedResponse.data, // Acessa os dados enviados pelo CoAP
    });
  });

  coapRequest.on("error", (error) => {
    console.error("Erro ao comunicar com o servidor CoAP:", error);
    res.status(500).json({ error: "Erro de comunicação com o servidor CoAP" });
  });

  coapRequest.end();
});

app.post("/proxy/imageCapture", (req, res) => {
  const { image } = req.body;

  if (!image) {
    return res.status(400).json({ error: "Imagem não fornecida" });
  }

  // Aqui você pode salvar/processar a imagem
  console.log("Imagem recebida com sucesso");

  res.status(200).json({ message: "Imagem processada com sucesso" });
});

app.post("/proxy/sensorData", async (req, res) => {
  const {
    id,
    gyro: gyroscope,
    accel: accelerometer,
    distance,
    geolocation,
  } = req.body;

  if (!id || !gyroscope || !accelerometer || !distance || !geolocation) {
    return res.status(400).json({
      error:
        "Payload inválido. Certifique-se de incluir ID, giroscópio, acelerômetro, distância e geolocalização válidos.",
    });
  }

  const payload = {
    id,
    gyro: gyroscope,
    accel: accelerometer,
    distance,
    geolocation,
  };

  const coapRequest = createCoapRequest("POST", "/sensorData", payload);

  coapRequest.on("response", (coapResponse) => {
    const responsePayload = coapResponse.payload.toString();

    if (coapResponse.code !== "2.05") {
      return res.status(500).json({
        error: "Erro no servidor CoAP",
        details: responsePayload,
      });
    }

    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responsePayload);
    } catch (error) {
      return res.status(500).json({
        error: "Erro ao processar a resposta do servidor CoAP",
        details: error.message,
      });
    }

    res.status(200).json({
      message: "Dados recebidos com sucesso do servidor CoAP",
      data: parsedResponse.data, // Acessa os dados processados
    });
  });

  coapRequest.on("error", (error) => {
    console.error("Erro ao comunicar com o servidor CoAP:", error);
    res.status(500).json({ error: "Erro de comunicação com o servidor CoAP" });
  });

  coapRequest.end();
});

app.listen(3000, () => {
  console.log("Servidor proxy executando na porta 3000");
});
