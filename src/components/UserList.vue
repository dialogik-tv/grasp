<template>
    <transition-group id="users" class="box" name="list" tag="div" enter-active-class="animate__animated animate__backInRight" leave-active-class="animate__animated animate__backOutLeft">
        <div v-for="user of sortedUsers" :key="user" class="user" :class="{ mod: user.badges.moderator, sub: user.badges.subscriber, vip: user.badges.vip }">
            <span class="username">{{ user.username }}</span>
            <span class="chatcount">{{ user.chatcount }}</span>
        </div>
    </transition-group>
</template>

<script>
export default {
    name: 'UserList',
    props: {
        users: Object,
        filter: Object
    },
    computed: {
        sortedUsers() {
            const usernameFilter = this.filter.username;
            return Object.values(this.users).sort(function compare(a, b) {
                // Sort users by chatcount (DESC)
                if(a.chatcount < b.chatcount) { return 1; }
                if(a.chatcount > b.chatcount) { return -1; }

                // Sort by username (ASC) if same count
                if(a.username > b.username) { return 1; }
                if(a.username < b.username) { return -1; }
                
                return 0;

            // And filter by username string (if any given)
            }).filter(function(user) {
                return user.username.toLowerCase().includes(usernameFilter.toLowerCase());
            });
        }
    },
}
</script>

<style scoped>
#users > div {
    display: flex;
    justify-content: space-between;
}

#users > .user {
    background-color: #1b1b1b;
    padding: 0 .5em;
    margin-bottom: .5em;
}

#users .username {
    color: #ccc;
    line-height: 36px;
}

#users > .user.vip {
    border-left: 30px solid blue;
}

#users > .user.sub {
    border-left: 30px solid green;
}

#users > .user.mod {
    border-left: 30px solid red;
}

#users .chatcount {
    font-size: 1.3em;
    font-weight: bold;
}
</style>
