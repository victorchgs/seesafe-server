import * as coap from "coap";
import fs from "fs";

const lowVisionUsersPath = "./data/lowVisionUsers.json";

function generateUniqueId() {
  return `id-${Date.now()}-${Math.random().toString(36)}`;
}

function saveIdToFile(id) {
  fs.readFile(lowVisionUsersPath, (err, data) => {
    const users = [];
    if (!err) {
      try {
        users = JSON.parse(data);
      } catch (parseError) {
        console.error("Erro ao ler o JSON existente:", parseError);
      }
    }

    if (!users.includes(id)) {
      users.push(id);

      fs.writeFile(
        lowVisionUsersPath,
        JSON.stringify(users, null, 2),
        (err) => {
          if (err) {
            console.error("Erro ao salvar o ID no arquivo:", err);
          } else {
            console.log("ID salvo com sucesso no arquivo.");
          }
        }
      );
    } else {
      console.log("ID já existe no banco de dados.");
    }
  });
}

const routes = {
  "/lowVisionAuth": {
    GET: (req, res) => {},
    POST: (req, res) => {
      const payload = req.payload?.toString();

      try {
        const data = JSON.parse(payload);
        const id = data.id;

        if (!id) {
          console.log("ID vazio. Gerando novo ID...");
          id = generateUniqueId();
          saveIdToFile(id);
        } else {
          console.log("ID recebido:", id);
        }

        res.code = "2.05";
        res.end(JSON.stringify({ id }));
      } catch (error) {
        console.error("Erro ao processar o payload:", error);

        res.code = "4.00";
        res.end("Erro ao processar o payload");
      }
    },
  },
};

function routeHandler(req, res) {
  const { url, method } = req;

  if (!url || !method) {
    res.code = "4.0";
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

server.listen(() => {
  console.log("Servidor CoAP iniciado na porta ...");
});
