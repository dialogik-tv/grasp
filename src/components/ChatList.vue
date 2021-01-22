<template>

    <transition-group
        id="chat"
        class="box"
        name="list"
        tag="div"
        enter-active-class="animate__animated animate__backInLeft"
        leave-active-class="animate__animated animate__backOutRight"
    >
        <div
            v-for="message in filteredChat.reverse()"
            :key="message"
            class="message"
            :class="{
                mod: message.tags.badges.moderator,
                sub: message.tags.badges.subscriber,
                vip: message.tags.badges.vip
            }"
            @click="message.pick = true"
        >
            <div class="meta">
                <div class="username">{{ message.username }}</div>
                <div class="timestamp">{{ moment(message.timestamp) }}</div>
            </div>
            <div class="body">{{ message.message }}</div>
        </div>
    </transition-group>
</template>

<script>
import moment from 'moment';

export default {
    name: 'ChatList',
    props: {
        chat: Array,
        filter: Object
    },
    computed: {
        filteredChat: function() {
            const usernameFilter = this.filter.username;

            // Filter by username string (if any given)
            return this.chat.filter(function(message) {
                return message.username.toLowerCase().includes(usernameFilter.toLowerCase());
            });
        }
    },
    methods: {
        moment: function(date) {
            return moment(date).startOf('minute').fromNow();
        }
    },
}
</script>

<style scoped>
</style>