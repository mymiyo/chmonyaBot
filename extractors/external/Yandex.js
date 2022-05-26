const { getYandexTrack } = require('../internal/yandex-scrapper');

class Yandex {
    
    constructor() {
        throw new Error(`The ${this.constructor.name} class may not be instantiated!`);
    }

    /**
     * Returns stream info
     * @param {string} url stream url
     */
    static async getInfo(url) {
        const data = await getYandexTrack(url).then();
        if (!data) return null;
        return {
            playlist: null,
            info: [{
            title: data[0].title || "Unknown song",
            duration: data[0].duration || 0,
            thumbnail: data[0].thumbnail || "https://upload.wikimedia.org/wikipedia/commons/2/2a/ITunes_12.2_logo.png",
            engine: data[0].streamURL,
            views: 0,
            author: data[0].author || "Unknown author",
            description: "",
            url: data[0].url,
            dominantColor: data[0].dominantColor
            }]
        }
    };

    static validate(url) {
        const REGEX = /^https?:\/\/music\.yandex\.\w+\/album\/\d+\/track\/\d+/;
        return REGEX.test(url || "");
    }

    static get important() {
        return true;
    }
}

module.exports = Yandex;