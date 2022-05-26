const { YMApi } = require ("ym-api");
const { getAverageColor } = require('fast-average-color-node');
const dotenv = require("dotenv")
const api = new YMApi();

dotenv.config();
const LOGIN = process.env.YA_LOGIN;
const PASS = process.env.YA_PASS;

function parseId(url) {
  const id = url.split("/").pop();
  return id;
}

async function getYandexTrack(url) {
  try {
    await api.init({ username: LOGIN, password: PASS });
    const song = await api.getTrack(parseId(url));
    const getTrackDownloadInfoResult = await api.getTrackDownloadInfo(song.map(s => s.id));

    const mp3Tracks = getTrackDownloadInfoResult
      .filter((r) => r.codec === "mp3")
      .sort((a, b) => b.bitrateInKbps - a.bitrateInKbps);
    const hqMp3Track = mp3Tracks[0];
    const streamURL = await api.getTrackDirectLink(hqMp3Track.downloadInfoUrl);

    const trackInfo = await Promise.all(
      song.map(async track => ({
        title: track.title,
        duration: track.durationMs,
        thumbnail: `https://${track.coverUri.slice(0, -2)}1000x1000`,
        streamURL: streamURL,
        author: `${track.artists.map(artist => artist.name).join(", ")}`,
        url: url,
        thumbnailColor: await getAverageColor(`https://${track.coverUri.slice(0, -2)}1000x1000`).then(color => color.hex)
      }))
      );
    return trackInfo;
    } catch (e) {
      console.log(`api error: ${e.message}`);
    }
}

module.exports = { getYandexTrack }