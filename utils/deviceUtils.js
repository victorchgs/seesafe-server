import fs from "fs";

const devicesPath = "./data/devices.json";

export function loadDevices() {
  try {
    const data = fs.readFileSync(devicesPath, "utf8");

    return JSON.parse(data);
  } catch (err) {
    if (err.code === "ENOENT") {
      console.warn("Arquivo não encontrado. Criando novo arquivo.");

      return [];
    }

    throw err;
  }
}

export function saveDevices(devices) {
  fs.writeFileSync(devicesPath, JSON.stringify(devices, null, 2), "utf8");
}

export function validateDeviceId(deviceId) {
  const devices = loadDevices();

  return devices.some(
    (device) => device.id === deviceId && device.status === "active"
  );
}
