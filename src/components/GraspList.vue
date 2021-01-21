<template>
    <transition-group id="grasp" class="box" name="list" tag="div" enter-active-class="animate__animated animate__backInDown" leave-active-class="animate__animated animate__backOutUp">
        <div v-for="message in filteredGrasp.reverse()" :key="message" class="message" :class="{ mod: message.tags.badges.moderator, sub: message.tags.badges.subscriber, vip: message.tags.badges.vip }" :title="`bc ${message.reason.broadcaster} | cc ${message.reason.chatcount} | hs ${message.reason.haystack} | sh ${message.reason.shorty} | mod ${message.reason.mod} | sub ${message.reason.sub} | vip ${message.reason.vip}`">
            <div class="username">{{ message.username }}</div>
            <div>{{ message.message }}</div>
        </div>
    </transition-group>
</template>

<script>
export default {
    name: 'GraspList',
    props: {
        grasp: Array,
        filter: Object
    },
    computed: {
        filteredGrasp() {
            // Filter by username string (if any given)
            const filter = this.filter;
            return this.grasp.filter(function(message) {
                return message.username.toLowerCase().includes(filter.username.toLowerCase());
            })
            // Filter Mod || Sub || VIP messages
            .filter(function(message) {
                if(
                    (filter.mod && message.tags.mod == 1)
                    || (filter.sub && message.tags.subscriber == 1)
                    || (filter.vip && message.tags.badges.vip == 1)
                ) {
                    return true;
                } else {
                    return false;
                }
            });
        }
    },
}
</script>

<style scoped>
</style>
