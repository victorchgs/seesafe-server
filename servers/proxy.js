import express from "express";
import coap from "coap";
import bodyParser from "body-parser";

const app = express();

app.use(bodyParser.json());

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

    try {
      const parsedResponse = JSON.parse(responsePayload);

      res.status(200).json({
        message: "deviceId processado com sucesso pelo servidor CoAP",
        data: parsedResponse.data,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Erro ao processar a resposta do servidor CoAP",
        details: error.message,
      });
    }
  });

  coapRequest.on("error", (error) => {
    console.error("Erro ao comunicar com o servidor CoAP:", error);

    res.status(500).json({ error: "Erro de comunicação com o servidor CoAP" });
  });

  coapRequest.end();
});

app.post("/proxy/sensorsDataCapture", async (req, res) => {
  const {
    deviceId,
    accelerometerData,
    gyroscopeData,
    geolocationData,
    imageData,
  } = req.body;

  if (
    !deviceId ||
    !accelerometerData ||
    !gyroscopeData ||
    !geolocationData ||
    !imageData
  ) {
    return res.status(400).json({ error: "Faltam dados necessários" });
  }

  const coapRequest = createCoapRequest("POST", "/sensorsDataCapture");

  const sensorData = {
    deviceId,
    accelerometerData,
    gyroscopeData,
    geolocationData,
    imageData,
  };

  coapRequest.write(JSON.stringify(sensorData));

  coapRequest.on("response", (coapResponse) => {
    const responsePayload = coapResponse.payload.toString();

    if (coapResponse.code !== "2.05") {
      return res.status(500).json({
        error: "Erro no servidor CoAP",
        details: responsePayload,
      });
    }

    try {
      const parsedResponse = JSON.parse(responsePayload);

      res.status(200).json({
        message:
          "Dados dos sensores processados com sucesso pelo servidor CoAP",
        data: parsedResponse.data,
      });
    } catch (error) {
      return res.status(500).json({
        error: "Erro ao processar a resposta do servidor CoAP",
        details: error.message,
      });
    }
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
