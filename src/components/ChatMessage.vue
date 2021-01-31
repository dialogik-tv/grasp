<template>
    <div v-html="formatEmotes(message, emotes)" class="body" :class="{ 'emote-sm': emotes.length > 5 }"></div>
</template>

<script>
export default {
    name: 'ChatMessage',
    props: {
        message: String,
        emotes: Object
    },
    methods: {
        formatEmotes(message, emotes) {
            let code = '';
            let img = '';
            let map = [];
            
            // Create code to image map
            for(const emote of emotes) {
                code = message.substring(emote.start, emote.end+1);
                if(code in map) {
                    continue;
                }
                img = `<img class="emoticon" src="http://static-cdn.jtvnw.net/emoticons/v1/${emote.id}/3.0">`;
                map[code] = img;
            }

            // Replace codes by images
            let regex = null;
            for(const code in map) {
                regex = new RegExp(code, 'g');
                message = message.replace(regex, map[code]);
            }

            return message;
        }
    }
}
</script>

<style>
.emoticon {
    max-width: 16%;
    min-width: 30px;
}

.emote-sm > img.emoticon {
    max-width: 30px;
}

.message.read > .body > .emoticon {
    -webkit-filter: grayscale(100%);
       -moz-filter: grayscale(100%);
         -o-filter: grayscale(100%);
        -ms-filter: grayscale(100%);
            filter: grayscale(100%);
           opacity: .5;
}
</style>