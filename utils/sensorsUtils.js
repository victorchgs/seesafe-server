import fs from "fs";

const sensorsDataPath = "./data/sensorsData.json";

export function saveSensorsData(deviceId, sensorsData) {
  fs.readFile(sensorsDataPath, (err, data) => {
    const allSensorsData = err
      ? []
      : (() => {
          try {
            return JSON.parse(data);
          } catch (parseError) {
            console.error(
              "Erro ao processar os dados dos sensores:",
              parseError
            );

            return [];
          }
        })();

    const deviceData = allSensorsData.find(
      (entry) => entry.deviceId === deviceId
    );

    if (deviceData) {
      deviceData.sensorsReadings.push({
        ...sensorsData,
        timestamp: new Date().toISOString(),
      });
    } else {
      allSensorsData.push({
        deviceId,
        sensorsReadings: [
          {
            ...sensorsData,
            timestamp: new Date().toISOString(),
          },
        ],
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
