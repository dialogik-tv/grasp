<template>
    <div>
        <div
            v-for="message in filteredPicks"
            :key="message"
            class="message"
            :class="{ read: message.read }"
            @click.exact="message.read = !message.read"
            @click.ctrl="message.pick = false"
        >
            <div class="meta">
                <div class="username">{{ message.username }}</div>
                <div class="timestamp">{{ moment(message.timestamp) }}</div>
            </div>
            <chat-message
                :message="message.message"
                :emotes="message.emotes"
            ></chat-message>
        </div>
    </div>
</template>

<script>
import moment from "moment";
import ChatMessage from "./ChatMessage.vue";

export default {
    name: "PickList",
    components: {
        ChatMessage,
    },
    props: {
        picks: Array,
        filter: Object
    },
    computed: {
        filteredPicks() {
            const filter = this.filter;
            const filtered = this.picks.filter(function(message) {
                return (
                    // Filter all picks
                    message.pick === true &&
                    // Filter by username string (if any given)
                    message.username.toLowerCase().includes(filter.username.toLowerCase())
                );
            });
            return filtered;
        }
    },
    methods: {
        moment: function (date) {
            return moment(date).startOf("minute").fromNow();
        }
    }
};
</script>