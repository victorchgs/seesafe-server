import { loadDevices, saveDevices } from "../utils/deviceUtils.js";
import { generateId } from "../utils/idUtils.js";

export function postDeviceAuthHandler(req, res) {
  const payload = req.payload?.toString();

  try {
    const data = JSON.parse(payload);
    const { deviceId } = data;
    const devices = loadDevices();

    if (deviceId) {
      console.log("ID recebido:", deviceId);

      const device = devices.find((device) => device.id === deviceId);

      if (device) {
        device.lastAccessed = new Date().toISOString();

        console.log(`Último acesso atualizado para o ID: ${deviceId}`);
      } else {
        console.log("ID não encontrado. Gerando novo ID...");

        const newDeviceId = generateId();

        devices.push({
          id: newDeviceId,
          createdAt: new Date().toISOString(),
          lastAccessed: new Date().toISOString(),
          status: "active",
        });
      }
    } else {
      console.log("ID vazio. Gerando novo ID...");

      const newDeviceId = generateId();

      devices.push({
        id: newDeviceId,
        createdAt: new Date().toISOString(),
        lastAccessed: new Date().toISOString(),
        status: "active",
      });
    }

    saveDevices(devices);

    res.code = "2.05";
    res.end(
      JSON.stringify({
        message: "Dispositivo autenticado com sucesso",
        data: { deviceId: deviceId || newDeviceId },
      })
    );
  } catch (error) {
    console.error("Erro ao processar o payload:", error.message);

    res.code = "4.00";
    res.end(
      JSON.stringify({
        error: "Erro ao processar o payload",
        details: error.message,
      })
    );
  }
}
