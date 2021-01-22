<template>
    <settings-panel :filter="filter"></settings-panel>
    <div id="dashboard">
        <chat-list :chat="chat" :filter="filter"></chat-list>
        <grasp-list :grasp="chat" :filter="filter"></grasp-list>
        <pick-list :picks="chat" :filter="filter"></pick-list>
        <user-list :users="users" :filter="filter"></user-list>
    </div>
    
</template>

<script>
// Todo: Emote parser https://gist.github.com/YannickFricke/09b6d716fc6490b4ee6bf8d9ebc10cdd

import TwitchJs from 'twitch-js';

import SettingsPanel from './components/SettingsPanel.vue';
import ChatList from './components/ChatList.vue';
import GraspList from './components/GraspList.vue';
import PickList from './components/PickList.vue';
import UserList from './components/UserList.vue';

import json from './assets/lang.de.json';

export default {
    name: 'App',
    components: {
        SettingsPanel,
        ChatList,
        GraspList,
        PickList,
        UserList
    },
    data() {
        return {
            config: {
                channel: 'dialogikTV'
            },
            chat: [],
            users: {},
            filter: {
                username: '',
                chatcount: true,
                mod: true,
                sub: true,
                vip: true
            }
        }
    },
    created() {
        // Parse URL param
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        if(urlParams.has('channel')) {
            this.config.channel = urlParams.get('channel');
        }
        
        // Initialize Twitch chat listener
        try {
            const { chat } = new TwitchJs({channel: this.config.channel});
            chat.connect().then(() => {
                chat.join(this.config.channel);
            });
            chat.on(TwitchJs.Chat.Events.ALL, this.handleMessage);
        } catch(e) {
            console.error('Twitch error', e);
        }
    },
    methods: {
        searchNeedles: function(haystack) {
            const sanitized = haystack.replace(/[^a-z]/gi, '');
            for(const needle of json.needles) {
                if(sanitized.toLowerCase().includes(needle)) {
                    return true;
                }
            }
            return false;
        },
        searchWords: function(message) {
            const sanitized = message.replace(/[^a-z]/gi, '');
            for(const word of json.words) {
                if(word == sanitized.toLowerCase()) {
                    return true;
                }
            }
            return false;
        },
        handleMessage: function(message) {
            // Only handle user chat messages (no tech stuff)
            if(message.event != 'PRIVMSG') {
                // console.log(message);
                return;
            }
            
            // Skip if no message user or content (smells like no user chat message)
            if(typeof message.message == 'undefined' || typeof message.username == 'undefined') {
                return;
            }

            // Skip !commands
            if(message.message.startsWith('!')) {
                return;
            }

            // Skip common chatbots
            const chatbots = [
                'streamlabs',
                'streamelements',
                'stay_hydrated_bot',
                'coebot',
                'moobot',
                'wizebot',
                'nightbot'
            ];
            if(chatbots.includes(message.username.toLowerCase())) {
                return;
            }

            // console.log('[Message] Incoming message', {message});

            // Add user to list or increase count
            message.username = message.tags.displayName; // Hack for nicer usernames
            if(!Object.prototype.hasOwnProperty.call(this.users, message.username)) {
                let user = {
                    ...message.tags,
                    chatcount: 1,
                    added: message.timestamp,
                    username: message.username
                };
                this.users[message.username] = user;
                // console.log('[Users] User added', {user}, {users});
            } else {
                this.users[message.username].chatcount++;
            }
            
            // Grasp the grasp out of the Twitch chat!
            const graspReport = this.getGrasp(message, this.users[message.username].chatcount);
            message.grasp = graspReport;

            // Add message to chat
            this.chat.push(message);
        },
        getGrasp: function(message, chatcount) {
            const grasp = {
                // Flag to filter
                isGrasp: false,

                // Detailed grasp report
                details: {
                    broadcaster: false,
                    chatcount: false,
                    haystack: false,
                    shorty: false,
                    mod: false,
                    sub: false,
                    vip: false
                }
            }

            // Let's make sure this is not a message addressed to someone else
            if(message.message.startsWith('@') && !message.message.toLowerCase().startsWith(`@${this.config.channel.toLowerCase()}`)) {
                // Skip (return initialized object)
                return grasp;
            }
            

            // Is the broadcaster adressed directly?
            if(message.message.toLowerCase().includes(`@${this.config.channel.toLowerCase()}`)) {
                grasp.details.broadcaster = true;
                grasp.isGrasp = true;
            }

            // Is the user new to the chat (first two messages)
            if(chatcount < 3) {
                grasp.details.chatcount = chatcount;
                grasp.isGrasp = true;
            }

            // Are there some short greetings like "hi", "hallo", "hey"
            if(this.searchWords(message.message)) {
                grasp.details.shorty = true;
                grasp.isGrasp = true;
            }
            
            // Search the haystack for some needles like
            // `guten morgen` in `ich wünsche einen <guten morgen>`
            if(this.searchNeedles(message.message)) {
                grasp.details.haystack = true;
                grasp.isGrasp = true;
            }
            
            // Mod?
            if(message.tags.mod == 1) {
                grasp.details.mod = true;
                grasp.isGrasp = true;
            }
            
            // Sub?
            if(message.tags.subscriber == 1) {
                grasp.details.sub = true;
                grasp.isGrasp = true;
            }
            
            // VIP?
            if(message.tags.badges.vip == 1) {
                grasp.details.vip = true;
                grasp.isGrasp = true;
            }

            return grasp;
        }
    }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Fira+Code&display=swap');

body {
    background-color: #000;
    color: #efefef;
    font-family: 'Fira Code', 'Courier new', monospace;
    letter-spacing: -2px;
    overflow-x: hidden;
}

/* See https://1linelayouts.glitch.me/ #7 */
#dashboard {
    display: grid;
    grid-gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}
.box {
    font-size: 1.3rem;
    padding: 1rem;
    align-items: stretch;
    text-align: left;
}

/* CSS styles for ChatList, GraspList and PickList */
.message {
    margin-bottom: 2rem;
    background-color: #1b1b1b;
    padding: .5em;
}

.message.vip {
    border-left: 30px solid blue;
}

.message.sub {
    border-left: 30px solid green;
}

.message.mod {
    border-left: 30px solid red;
}

#chat .username, #grasp .username {
    font-size: .7em;
    color: #888;
    font-weight: bold;
}

/* Animation.css customization */
:root {
    --animate-duration: 210ms;
}
</style>
