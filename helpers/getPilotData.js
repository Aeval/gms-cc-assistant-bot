const { shareApiUrl, apiKey } = require("../config.json");

module.exports = async function getPilotData(sharecode) {
  const ccResp = await fetch(shareApiUrl + "share?code=" + sharecode, {
    method: "GET",
    headers: new Headers({
      "x-api-key": apiKey,
    }),
  }).then(async (resp) => await resp.json());

  const pilotData = await fetch(ccResp.presigned, {
    method: "GET",
    headers: new Headers({
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    }),
  }).then(async (s3Resp) => await s3Resp.json());

  return { metadata: ccResp.Item, pilotData: pilotData };
};
