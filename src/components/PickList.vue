<template>
    <transition-group
        id="picks"
        class="box"
        name="list"
        tag="div"
    >
    <!-- 
        enter-active-class="animate__animated animate__slideInLeft"
        leave-active-class="animate__animated animate__slideOutRight"
    -->
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
            <chat-message :message="message.message" :emotes="message.emotes"></chat-message>
        </div>
    </transition-group>
</template>

<script>
import moment from 'moment';
import ChatMessage from './ChatMessage.vue';

export default {
    name: 'PickList',
    components: {
        ChatMessage
    },
    props: {
        picks: Array,
        filter: Object
    },
    computed: {
        filteredPicks() {
            const filter = this.filter;
            return this.picks.filter(function(message) {
                return (
                    // Filter all picks
                    message.pick === true

                    // Filter by username string (if any given)
                    && message.username.toLowerCase().includes(filter.username.toLowerCase())
                );
            });
        }
    },
    methods: {
        moment: function(date) {
            return moment(date).startOf('minute').fromNow();
        }
    }
}
</script>

<style scoped>
</style>
