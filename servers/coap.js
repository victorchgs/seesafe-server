import coap from "coap";
import { getSensorsDataHandler } from "../handlers/getSensorsDataHandler.js";
import { postDeviceAuthHandler } from "../handlers/postDeviceAuthHandler.js";
import { postSensorsDataHandler } from "../handlers/postSensorsDataHandler.js";
import { postShareCodeValidationHandler } from "../handlers/postShareCodeValidationHandler.js";

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
  "/sensorsData": {
    GET: getSensorsDataHandler,
    POST: postSensorsDataHandler,
  },
  "/shareCodeValidation": {
    POST: postShareCodeValidationHandler,
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
