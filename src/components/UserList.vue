<template>
    <div
        id="users"
        class="box"
    >
        <div
            v-for="user of sortedUsers"
            :key="user"
            class="user"
            :class="{
                mod: user.badges.moderator,
                sub: user.badges.subscriber,
                vip: user.badges.vip
            }"
            @click="$emit('filterUsername', user.username)"
        >
            <span class="username">{{ user.username }}</span>
            <span class="chatcount">{{ user.chatcount }}</span>
        </div>
    </div>
</template>

<script>
export default {
    name: 'UserList',
    props: {
        users: Object,
        filter: Object
    },
    emits: {
        filterUsername: String
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
            })
            // And filter by username string (if any given)
            .filter(function(user) {
                return user.username.toLowerCase().includes(usernameFilter.toLowerCase());
            });
        }
    },
}
</script>

<style scoped>
#users {
    position: fixed;
    top: 0;
    right: 0;
    width: 20%;
    min-width: 320px;
    height: 92vh;
    overflow-y: scroll;
    background: rgba(0, 0, 0, .8);
    padding: 0 1rem;
    margin-top: 3rem;
}

#users::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}
#users::-webkit-scrollbar-thumb {
    background: #222;
    border-radius: 3px;
}
#users::-webkit-scrollbar-thumb:hover {
    background: #444;
}
#users::-webkit-scrollbar-track {
    background: #000;
    border-radius: 3px;
}

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
    color: var(--username-color);
    line-height: 36px;
    cursor: pointer;
    overflow: hidden;
}

#users > .user.vip {
    border-left: 20px solid #00ff00;
}

#users > .user.sub {
    border-left: 20px solid #fff;
}

#users > .user.mod {
    border-left: 20px solid purple;
}

#users .chatcount {
    font-size: 1.3em;
    font-weight: bold;
}
</style>
