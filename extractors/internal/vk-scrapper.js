const cheerio = require('cheerio');

const _importDynamic = new Function('modulePath', 'return import(modulePath)')
async function fetch(url) {
  const {default: fetch} = await _importDynamic('node-fetch');
  return fetch(url);
}

function parseMilleseconds(time) {
  const timeParts = time.split(':');
  return parseInt(timeParts[0]) * 60 * 1000 + parseInt(timeParts[1]) * 1000;
}

// function getThumbnail(artist, title, $) {
//   const playlist_div = $('.playlist');
//   for(let i = 0; i < playlist_div.length; i++){
//     if($(playlist_div[i]).find('.title').text() === title) {
//       if($(playlist_div[i]).find('.author').text() === artist) {
//         return $(playlist_div[i]).find('.cover').attr('style').split(/['']/)[1];
//       }
//     }
//   }
// }

function getThumbnail(artist, title, $) {
  const playlist_div = $('.playlist');
  return $(playlist_div[0]).find('.cover').attr('style').split(/['']/)[1];
}

function getPlaylink(href) {
  return `https://vrit.me/audio.php?play=${href.split('url=')[1]}`;
}


async function getVkAudios(url) {
  try {
        const html = await fetch(url);
        const $ = cheerio.load(await html.text());
        const audio_div = $('.audio');

        let audios = [];

        for(let i = 0; i < audio_div.length; i++) {
          const artist = $(audio_div[i]).find('.artist').text();
          const title = $(audio_div[i]).find('.title').text();

          audios.push({
          title: title || "",
          author: artist,
          streamURL: getPlaylink($(audio_div[i]).find('a').attr('href')),
          duration: parseMilleseconds($(audio_div[i]).find('.duration').text()),
          thumbnail: getThumbnail(artist, title, $) })
        }
        if(audios.length === 0) return null;
        else return audios
      } catch (e) {
      console.log(`api error: ${e.message}`);
    }
}

module.exports = { getVkAudios }