<template>
    <transition
        name="list-holder"
        enter-active-class="animate__animated animate__slideInLeft"
        leave-active-class="animate__animated animate__slideOutLeft"
    >
        <transition-group
            v-if="visible"
            id="chat"
            class="box"
            name="list"
            tag="div"
            enter-active-class="animate__animated animate__slideInLeft"
        >
            <div
                v-for="message in filteredChat"
                :key="message"
                class="message"
                :class="{
                    mod: message.tags.badges.moderator,
                    sub: message.tags.badges.subscriber,
                    vip: message.tags.badges.vip,
                    read: message.read,
                    redemption: message.grasp.details.redemption
                }"
                @click.exact="message.read = !message.read"
                @click.alt="message.pick = true"
                :title="`
bc ${message.grasp.details.mention}
cc ${message.grasp.details.chatcount}
hs ${message.grasp.details.haystack}
sh ${message.grasp.details.shorty}
mod ${message.grasp.details.mod}
sub ${message.grasp.details.sub}
vip ${message.grasp.details.vip}`"
            >
                <div class="meta">
                    <div class="username">{{ message.username }}</div>
                    <div class="timestamp">{{ moment(message.timestamp) }}</div>
                </div>
                <chat-message :message="message.message" :emotes="message.tags.emotes"></chat-message>
            </div>
        </transition-group>
    </transition>
</template>

<script>
import moment from 'moment';
import ChatMessage from './ChatMessage.vue';

export default {
    name: 'ChatList',
    components: {
        ChatMessage
    },
    props: {
        visible: Boolean,
        chat: Array,
        filter: Object
    },
    computed: {
        filteredChat() {
            const usernameFilter = this.filter.username;

            // Filter by username string (if any given)
            if(usernameFilter) {
                return this.chat.filter(function(message) {
                    return message.username.toLowerCase().includes(usernameFilter.toLowerCase());
                });
            } else {
                return this.chat.slice(0, 100);
            }
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