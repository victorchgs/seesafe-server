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

app.listen(3000, () => {
  console.log("Proxy rodando na porta 3000");
});
