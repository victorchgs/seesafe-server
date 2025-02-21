import fs from "fs";

const sensorsDataPath = "../data/sensorsData.json";

export function loadSensorsData(deviceId) {
  if (!fs.existsSync(sensorsDataPath)) {
    return null;
  }

  try {
    const allSensorsData = JSON.parse(
      fs.readFileSync(sensorsDataPath, "utf-8")
    );

    const deviceData = allSensorsData.find(
      (entry) => entry.deviceId === deviceId
    );

    return deviceData ? deviceData.sensorsReadings : null;
  } catch (error) {
    console.error("Erro ao carregar dados dos sensores:", error);
    return null;
  }
}

export function saveSensorsData(deviceId, sensorsData) {
  fs.readFile(sensorsDataPath, (err, data) => {
    let allSensorsData = [];

    if (!err) {
      try {
        allSensorsData = JSON.parse(data);
      } catch (parseError) {
        console.error("Erro ao processar os dados dos sensores:", parseError);
      }
    }

    const deviceIndex = allSensorsData.findIndex(
      (entry) => entry.deviceId === deviceId
    );

    if (deviceIndex !== -1) {
      allSensorsData[deviceIndex].sensorsReadings = {
        ...sensorsData,
        timestamp: new Date().toISOString(),
      };
    } else {
      allSensorsData.push({
        deviceId,
        sensorsReadings: {
          ...sensorsData,
          timestamp: new Date().toISOString(),
        },
      });
    }

    fs.writeFile(
      sensorsDataPath,
      JSON.stringify(allSensorsData, null, 2),
      (writeError) => {
        if (writeError) {
          console.error("Erro ao salvar dados do sensor:", writeError);
        } else {
          console.log("Dados dos sensores salvos com sucesso.");
        }
      }
    );
  });
}
