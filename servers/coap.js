import coap from "coap";
import { postDeviceAuthHandler } from "../handlers/postDeviceAuthHandler.js";
import { postSensorsDataCaptureHandler } from "../handlers/postSensorsDataCaptureHandler.js";

const routes = {
  "/deviceAuth": {
    GET: (req, res) => {
      res.code = "4.04";
      res.end("GET deviceAuth");
    },
    POST: postDeviceAuthHandler,
  },
  "/sensorsDataCapture": {
    GET: (req, res) => {
      res.code = "2.05";
      res.end("GET sensorsDataCapture");
    },
    POST: postSensorsDataCaptureHandler,
  },
};

function routeHandler(req, res) {
  const { url, method } = req;

  if (!url || !method) {
    res.code = "4.00";

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
