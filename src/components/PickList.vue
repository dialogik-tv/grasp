<template>
    <transition-group
        id="picks"
        class="box"
        name="list"
        tag="div"
        enter-active-class="animate__animated animate__backInDown"
        leave-active-class="animate__animated animate__backOutUp"
    >
        <div
            v-for="message in filteredPicks.reverse()"
            :key="message"
            class="message"
            :class="{ checked: message.pick === null }"
            @click.exact="handlePickStatus(message)"
            @click.ctrl="message.pick = false"
        >
            <div class="username">{{ message.username }}</div>
            <div class="body">{{ message.message }}</div>
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
            const filter = this.filter;

            // Filter all picks
            return this.picks.filter(function(message) {
                return message.pick || message.pick === null;
            })
            
            // Filter by username string (if any given)
            .filter(function(message) {
                return message.username.toLowerCase().includes(filter.username.toLowerCase());
            });
        }
    },
    methods: {
        handlePickStatus(message) {
            if(message.pick === null) {
                message.pick = true;
            } else if(message.pick === true) {
                message.pick = null;
            }
        }
    }
}
</script>

<style scoped>
.message.checked {
    color: #444;
}
</style>
