<template>
    <transition-group
        id="grasp"
        class="box"
        name="list"
        tag="div"
        enter-active-class="animate__animated animate__backInDown"
        leave-active-class="animate__animated animate__backOutUp"
    >
        <div
            v-for="message in filteredGrasp.reverse()"
            :key="message"
            class="message"
            :class="{
                mod: message.grasp.details.mod,
                sub: message.grasp.details.sub,
                vip: message.grasp.details.vip,
                chatcount: message.grasp.details.chatcount !== false,
                mention: message.grasp.details.broadcaster,
                shorty: message.grasp.details.shorty,
                haystack: message.grasp.details.haystack
            }"
            @click="message.pick = true"
            :title="`
bc ${message.grasp.details.broadcaster}
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
            <div class="body">{{ message.message }}</div>
            <div
                v-if="message.grasp.details.chatcount !== false"
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

export default {
    name: 'GraspList',
    props: {
        grasp: Array,
        filter: Object
    },
    computed: {
        filteredGrasp() {
            const filter = this.filter;
            
            return this.grasp.filter(function(message) {
                return message.grasp.isGrasp === true;
            })

            // Filter by username string (if any given)
            .filter(function(message) {
                return message.username.toLowerCase().includes(filter.username.toLowerCase());
            })
            
            // Filter Mod || Sub || VIP messages
            .filter(function(message) {
                // Skip filter if message is grasp due to other reasons
                if(
                    message.grasp.details.broadcaster !== false
                    || message.grasp.details.chatcount !== false
                    || message.grasp.details.haystack !== false
                    || message.grasp.details.shorty !== false
                ) {
                    return true;
                }

                if(
                    (filter.mod && message.grasp.details.mod)
                    || (filter.sub && message.grasp.details.sub)
                    || (filter.vip && message.grasp.details.vip)
                ) {
                    return true;
                }
                
                return false
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
.message {
    position: relative;
}

.message > .count {
    position: absolute;
    top: -12px;
    right: -12px;
    background: #00acee;
    font-weight: bold;
    font-size: .8em;
    padding: .5em .8em;
    border-radius: 20%;
}

.message > .count-1 {
    background: #fff;
    color: #00acee;
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
