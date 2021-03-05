<template>
    <transition-group
        id="grasp"
        class="box"
        name="list"
        tag="div"
    >
    <!-- enter-active-class="animate__animated animate__slideInDown" -->
        <div
            v-for="message in filteredGrasp"
            :key="message"
            class="message"
            :class="{
                mod: message.grasp.details.mod,
                sub: message.grasp.details.sub,
                vip: message.grasp.details.vip,
                chatcount: message.grasp.details.chatcount !== false,
                first: message.grasp.details.chatcount === 1,
                second: message.grasp.details.chatcount === 2,
                mention: message.grasp.details.mention,
                shorty: message.grasp.details.shorty,
                haystack: message.grasp.details.haystack || message.grasp.details.shorty,
                read: message.read,
                redemption: message.grasp.details.redemption
            }"
            @click.exact="message.read = !message.read"
            @click.alt="message.pick = true"
            :title="createTitle(message)"
        >
            <div class="meta">
                <div class="username">{{ message.username }}</div>
                <div class="timestamp">{{ moment(message.timestamp) }}</div>
            </div>
            <chat-message :message="message.message" :emotes="message.tags.emotes"></chat-message>
            <div
                v-if="message.grasp.details.chatcount > 0"
                class="count"
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
                    || (message.grasp.details.redemption)
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
        },
        createTitle: function(message) {
            let string = '';
            if(message.grasp.details.mention) {
                string += '- Mention@' + "\n";
            }
            if(message.grasp.details.chatcount === 1) {
                string += '- First message' + "\n";
            }
            if(message.grasp.details.chatcount === 2) {
                string += '- Second message' + "\n";
            }
            if(message.grasp.details.haystack) {
                string += '- Needle found in haystack' + "\n";
            }
            if(message.grasp.details.mod) {
                string += '- User is a mod' + "\n";
            }
            if(message.grasp.details.sub) {
                string += '- User is a sub' + "\n";
            }
            if(message.grasp.details.vip) {
                string += '- User is a vip' + "\n";
            }
            if(!string) { return }
            return "Reasons for grasp:\n\n" + string;
        }
    },
}
</script>

<style scoped>
.message {
    /* Important for .count positioning */
    position: relative;
}

.message > .count {
    position: absolute;
    top: -12px;
    right: -10px;
    background: var(--mention-color);
    -webkit-text-stroke: 1px #000;
    font-weight: bold;
    font-size: 2rem;
    padding: .2rem 1rem;
    border-radius: 20%;
}

.message.first {
    background-color: var(--mod-color);
}

.message.first > .count {
    background-color: var(--mod-color);
    border: 3px solid var(--background-color)
}

.message.second {
    background-color: var(--mod-light-color);
}

.message.first .username, .message.first .timestamp {
    color: var(--background-light-color) !important;
}

.message.chatcount .timestamp {
    margin-right: 2.8rem;
}

.message.read.chatcount > .count {
    background: var(--mention-color);
    color: var(--text-color);
}

.message.read.chatcount > .count {
    background: var(--mention-color);
    color: var(--text-color);
}

.message.shorty .body {
    font-size: 3em;
    font-weight: bold;
}

.message.haystack {
    border-left: 1rem solid var(--haystack-color);
}

.message.mention {
    border-left: 1rem solid var(--mention-color);
}

/* @keyframes flash {
    0% {
        background-color: #fff;
        color: #222;
    }
    20% {
        background-color: purple;
        color: #fff;
    }
    40% {
        background-color: #fff;
        color: #222;
    }
    60% {
        background-color: purple;
        color: #fff;
    }
    80% {
        background-color: #fff;
        color: #222;
    }
    100% {
        background-color: #1b1b1b;
        color: #fff;
    }
} */
</style>
