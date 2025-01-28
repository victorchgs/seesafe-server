import coap from "coap";
import { postDeviceAuthHandler } from "../handlers/postDeviceAuthHandler.js";
import { postSensorsDataCaptureHandler } from "../handlers/postSensorsDataCaptureHandler.js";

const routes = {
  "/deviceAuth": {
    GET: (req, res) => {
      res.code = "4.04";
      res.end(
        JSON.stringify({
          statusCode: "4.04",
          body: {
            message: "Not Found",
            data: "GET não suportado para /deviceAuth",
          },
        })
      );
    },
    POST: postDeviceAuthHandler,
  },
  "/sensorsDataCapture": {
    GET: (req, res) => {
      res.code = "2.05";
      res.end(
        JSON.stringify({
          statusCode: "2.05",
          body: {
            message: "Content",
            data: "GET sensorsDataCapture",
          },
        })
      );
    },
    POST: postSensorsDataCaptureHandler,
  },
  "/predictFall": {
    POST: postPredictionHandler,
  },
};

function routeHandler(req, res) {
  const { url, method } = req;

  if (!url || !method) {
    res.code = "4.00";
    res.end(
      JSON.stringify({
        statusCode: "4.00",
        body: {
          message: "Bad Request",
          data: "URL ou método inválido",
        },
      })
    );
    return;
  }

  const resource = routes[url];

  if (resource && resource[method]) {
    return resource[method](req, res);
  }

  res.code = "4.04";
  res.end(
    JSON.stringify({
      statusCode: "4.04",
      body: {
        message: "Not Found",
        data: "Recurso não encontrado",
      },
    })
  );
}

const server = coap.createServer();

server.on("request", routeHandler);

server.listen(5683, () => {
  console.log("Servidor CoAP executando na porta 5683");
});
