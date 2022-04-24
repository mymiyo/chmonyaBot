const { YMApi } = require ("ym-api");
const api = new YMApi();


function parseId(url) {
  const id = url.split("/").pop();
  return id;
}

async function getYandexTrack(url) {
  try {
    await api.init({ username: "Tifty", password: "HelopGWORS735392" });

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
        thumbnail: "https://" + track.coverUri.slice(0, -2) + "1000x1000",
        streamURL: streamURL,
        author: `${track.artists.map(artist => artist.name).join(", ")}`,
        url: url
      }))
      );
    return trackInfo;
    } catch (e) {
      console.log(`api error: ${e.message}`);
    }
}

module.exports = { getYandexTrack }