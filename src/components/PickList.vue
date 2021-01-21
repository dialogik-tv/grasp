<template>
    <transition-group id="picks" class="box" name="list" tag="div" enter-active-class="animate__animated animate__backInDown" leave-active-class="animate__animated animate__backOutUp">
        <div v-for="message in filteredPicks.reverse()" :key="message" class="message" :class="{ mod: message.tags.badges.moderator, sub: message.tags.badges.subscriber, vip: message.tags.badges.vip }" :title="`bc ${message.reason.broadcaster} | cc ${message.reason.chatcount} | hs ${message.reason.haystack} | sh ${message.reason.shorty} | mod ${message.reason.mod} | sub ${message.reason.sub} | vip ${message.reason.vip}`">
            <div class="username">{{ message.username }}</div>
            <div>{{ message.message }}</div>
        </div>
    </transition-group>
</template>

<script>
export default {
    name: 'PickList',
    props: {
        picks: Array,
        filter: Object
    },
    computed: {
        filteredPicks() {
            // Filter by username string (if any given)
            const filter = this.filter;
            return this.picks.filter(function(message) {
                return message.username.toLowerCase().includes(filter.username.toLowerCase());
            });
        }
    },
}
</script>

<style scoped>
</style>
