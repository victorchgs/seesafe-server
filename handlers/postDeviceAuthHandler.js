import { loadDevices, saveDevices } from "../utils/deviceUtils.js";
import { generateId } from "../utils/idUtils.js";

export function postDeviceAuthHandler(req, res) {
  const payload = req.payload?.toString();

  try {
    const data = JSON.parse(payload);
    const devices = loadDevices();
    let deviceId = data.deviceId;

    if (deviceId) {
      console.log("ID recebido:", deviceId);

      const device = devices.find((device) => device.id === deviceId);

      if (device) {
        device.lastAccessed = new Date().toISOString();

        console.log(`Último acesso atualizado para o ID: ${deviceId}`);
      } else {
        console.log("ID não encontrado. Gerando novo ID...");
        deviceId = generateId();

        devices.push({
          id: deviceId,
          createdAt: new Date().toISOString(),
          lastAccessed: new Date().toISOString(),
          status: "active",
        });
      }
    } else {
      console.log("ID vazio. Gerando novo ID...");
      deviceId = generateId();

      devices.push({
        id: deviceId,
        createdAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        status: "active",
      });
    }

    saveDevices(devices);

    res.code = "2.05";
    res.end(
      JSON.stringify({
        statusCode: "2.05",
        body: {
          message: "Content",
          data: JSON.stringify({ deviceId }),
        },
      })
    );
  } catch (error) {
    console.error("Erro ao processar o payload:", error.message);

    res.code = "4.00";
    res.end(
      JSON.stringify({
        statusCode: "4.00",
        body: {
          message: "Bad Request",
          data: JSON.stringify({
            error: "Erro ao processar o payload",
            details: error.message,
          }),
        },
      })
    );
  }
}
