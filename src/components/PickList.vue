<template>
    <transition-group
        id="picks"
        class="box"
        name="list"
        tag="div"
        enter-active-class="animate__animated animate__slideInLeft"
        leave-active-class="animate__animated animate__slideOutRight"
    >
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
            <div class="body">{{ message.message }}</div>
        </div>
    </transition-group>
</template>

<script>
import moment from 'moment';

export default {
    name: 'PickList',
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
