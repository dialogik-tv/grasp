<template>
    <transition-group
        id="grasp"
        class="box"
        name="list"
        tag="div"
        enter-active-class="animate__animated animate__slideInDown"
    >
        <div
            v-for="message in filteredGrasp"
            :key="message"
            class="message"
            :class="{
                mod: message.grasp.details.mod,
                sub: message.grasp.details.sub,
                vip: message.grasp.details.vip,
                chatcount: message.grasp.details.chatcount !== false,
                mention: message.grasp.details.mention,
                shorty: message.grasp.details.shorty,
                haystack: message.grasp.details.haystack || message.grasp.details.shorty,
                read: message.read,
                redemption: message.tags.customRewardId
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
            <div
                v-if="message.grasp.details.chatcount > 0"
                class="count"
                :class="`count-${message.grasp.details.chatcount}`"
            >
                {{ message.grasp.details.chatcount }}
            </div>
        </div>
    </transition-group>
</template>

<script>
import moment from 'moment';
import ChatMessage from './ChatMessage.vue';

export default {
    name: 'GraspList',
    components: {
        ChatMessage
    },
    props: {
        grasp: Array,
        filter: Object
    },
    computed: {
        filteredGrasp() {
            const filter = this.filter;
            
            // Filter Mod || Sub || VIP || Chatcount messages
            const result = this.grasp.filter(function(message) {
                // Show messages according to filter settings
                if(
                    (filter.mention && message.grasp.details.mention)
                    || (filter.mod && message.grasp.details.mod)
                    || (filter.sub && message.grasp.details.sub)
                    || (filter.vip && message.grasp.details.vip)
                    || (filter.chatcount && message.grasp.details.chatcount > 0)
                    || (filter.haystack && message.grasp.details.haystack)
                    || (filter.shorty && message.grasp.details.shorty)
                ) { return true; }
                
                return false;
            });

            // Filter by username string (if any given)
            if(filter.username) {
                result.filter(function(message) {
                    return message.username.toLowerCase().includes(filter.username.toLowerCase());
                });
            }

            return result;
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
.message {
    position: relative;
}

.message.chatcount .timestamp {
    margin-right: 1.8rem;
}

.message > .count {
    position: absolute;
    top: -12px;
    right: -12px;
    background: #00acee;
    font-weight: bold;
    font-size: .9em;
    padding: .5em .8em;
    border-radius: 20%;
}

.message > .count-1 {
    background: #fff;
    color: #00acee;
}

.message.read > .count, .message.read > .count-1 {
    background: #333;
    color: #888;
}

.message.shorty .body {
    font-size: 3em;
    font-weight: bold;
}

.message.haystack {
    border-left: 20px solid yellow;
}

.message.mention {
    border-left: 20px solid #00acee;
}
</style>
