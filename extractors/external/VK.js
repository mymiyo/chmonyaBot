const { getVkAudios } = require('../internal/vk-scrapper');

class VK {
    
    constructor() {
        throw new Error(`The ${this.constructor.name} class may not be instantiated!`);
    }

    /**
     * Returns stream info
     * @param {string} url stream url
     */
    static async getInfo(url) {
        
        const data = await getVkAudios(url).then();
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
            url: data[0].url
            }]
        }
    };

    static validate(url) {
        const REGEX = /^https?:\/\/vrit.me\/data.php\?method=audio.search&count=\d+\&offset=\d+&q=.*/;
        return REGEX.test(url || "");
    }

    static get important() {
        return true;
    }
}

module.exports = VK;