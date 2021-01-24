<template>
    <settings-panel :filter="filter"></settings-panel>
    <div id="dashboard">
        <chat-list
            :chat="chat"
            :filter="filter"
            :visible="visible.chat"
            class="message-list"
        ></chat-list>
        <grasp-list
            :grasp="chat"
            :filter="filter"
            class="message-list"
        ></grasp-list>
        <pick-list
            :picks="chat"
            :filter="filter"
            class="message-list"
        ></pick-list>
   </div>
    <user-list
        :users="users"
        :filter="filter"
        :visible="visible.users"
        @filterUsername="this.filter.username = $event"
    ></user-list>
</template>

<script>
// Todo: Emote parser https://gist.github.com/YannickFricke/09b6d716fc6490b4ee6bf8d9ebc10cdd

import TwitchJs from 'twitch-js';
import '../node_modules/animate.css/animate.min.css';

import SettingsPanel from './components/SettingsPanel.vue';
import ChatList from './components/ChatList.vue';
import GraspList from './components/GraspList.vue';
import PickList from './components/PickList.vue';
import UserList from './components/UserList.vue';

import lang from './assets/lang.de.json';

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
            visible: {
                chat: true,
                users: false
            },
            filter: {
                username: '',
                mention: true,
                chatcount: true,
                mod: false,
                sub: false,
                vip: false,
                haystack: true,
                shorty: true
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
        
        // Add target channel to title
        document.title = `grasping #${this.config.channel}`;

        // Add keyboard shortcuts
        const filter = this.filter;
        const visible = this.visible;
        window.addEventListener("keyup", function(event) {
            if(event.defaultPrevented) {
                return; // Do nothing if the event was already processed
            }

            switch(event.key) {
                // Filter settings
                case "x":
                    // [X] - Remove all filters
                    if(!event.altKey) {
                        filter.username = '';
                        filter.chatcount = false;
                        filter.mention = false;
                        filter.mod = false;
                        filter.sub = false;
                        filter.vip = false;
                        filter.haystack = false;
                        filter.shorty = false;
                    
                    // [Alt+X] – Set default filters
                    } else {
                        // Default
                        filter.chatcount = true;
                        filter.mention = true;
                        filter.haystack = true;
                        filter.shorty = true;

                        // Roles are no default
                        filter.mod = false;
                        filter.sub = false;
                        filter.vip = false;
                    }
                    break;
                case "X":
                    // [Shift+X] - Activate all filters
                    filter.chatcount = true;
                    filter.mention = true;
                    filter.mod = true;
                    filter.sub = true;
                    filter.vip = true;
                    filter.haystack = true;
                    filter.shorty = true;
                    break;
                case "C":
                    // [Shift+C] - Chatcount
                    filter.chatcount = !filter.chatcount;
                    break;
                case "m":
                    // [M] - Mention
                    filter.mention = !filter.mention;
                    break;
                case "M":
                    // [Shift+M] - Mods
                    filter.mod = !filter.mod;
                    break;
                case "S":
                    // [Shift+S] - Subs
                    filter.sub = !filter.sub;
                    break;
                case "V":
                    // [Shift+V] - VIPs
                    filter.vip = !filter.vip;
                    break;
                case "H":
                    // [Shift+H] - Haystack needles
                    filter.haystack = !filter.haystack;
                    break;
                case "h":
                    // [Shift+H] - Shorties (because a shorty is a small haystack result)
                    filter.shorty = !filter.shorty;
                    break;

                // Toggle chat/userlist
                case "c":
                    // [C] - Toggle chat
                    visible.chat = !visible.chat;
                    break;
                case "u":
                    // [U] - Toggle users
                    visible.users = !visible.users;
                    break;
                default:
                    return; // Quit when this doesn't handle the key event.
            }
            // Cancel the default action to avoid it being handled twice
            event.preventDefault();
        }, true);
        // the last option dispatches the event to the listener first,
        // then dispatches event to window

        // Initialize Twitch chat listener
        try {
            const { chat } = new TwitchJs({channel: this.config.channel});
            chat.connect().then(() => {
                chat.join(this.config.channel);
            }).catch((e) => { console.error('Twitch error in Promise', e); });
            chat.on(TwitchJs.Chat.Events.ALL, this.handleMessage);
        } catch(e) {
            console.error('Twitch error', e);
        }
    },
    methods: {
        searchNeedles: function(haystack) {
            const sanitized = haystack.replace(/[^a-z\s]/gi, '').toLowerCase();
            for(const needle of lang.needles) {
                if(sanitized.includes(needle)) {
                    return true;
                }
            }
            return false;
        },
        searchWords: function(message) {
            const sanitized = message.replace(/[^a-z]/gi, '');
            for(const word of lang.words) {
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
            message.username = message.tags.username = message.tags.displayName; // Hack for nicer usernames
            if(!Object.prototype.hasOwnProperty.call(this.users, message.tags.userId)) {
                let user = {
                    ...message.tags.badges,
                    chatcount: 1
                };
                this.users[message.tags.userId] = user;
                // console.log('[Users] User added', {user}, {users});
            } else {
                this.users[message.tags.userId].chatcount++;
            }
            
            // Grasp the grasp out of the Twitch chat!
            const graspReport = this.getGrasp(message, this.users[message.tags.userId].chatcount);
            message.grasp = graspReport;

            // Initialize pick and read
            message.pick = false;
            message.read = false;

            // Add message to chat
            this.chat.unshift(message);
        },
        getGrasp: function(message, chatcount) {
            const grasp = {
                // Flag to filter
                isGrasp: false,

                // Detailed grasp report
                details: {
                    mention: false,
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
                grasp.details.mention = true;
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
    margin: 0;
    padding: 1rem;
    padding-bottom: 0;
}

a {
    color: #00acee;
    text-decoration: none;
}
a:hover {
    border-bottom: 1px solid #00acee;
}

/* See https://1linelayouts.glitch.me/ #7 */
#dashboard {
    display: grid;
    grid-gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    margin-top: .4rem;
}
.box {
    font-size: 1.3rem;
    padding: 0;
    padding-right: 1rem;
    align-items: stretch;
    text-align: left;
}

/* CSS styles for ChatList, GraspList and PickList */
.message-list {
    height: 91vh;
    overflow-x: hidden;
    overflow-y: scroll;
    padding-top: 1rem;
    padding-right: 1rem;
}
#grasp.message-list {
    padding-right: 2rem;
}

.message-list::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}
.message-list::-webkit-scrollbar-thumb {
    background: #222;
    border-radius: 3px;
}
.message-list::-webkit-scrollbar-thumb:hover {
    background: #444;
}
.message-list::-webkit-scrollbar-track {
    background: #000;
    border-radius: 3px;
}

.message {
    margin-bottom: 1rem;
    background-color: #1b1b1b;
    padding: .6rem;
    cursor: pointer;
}

.message > .meta {
    display: flex;
    justify-content: space-between;
    margin-bottom: .5rem;
}

.message .body {
    overflow-x: hidden;
}

.message .timestamp {
    color: #888;
    font-size: .8rem;
}

.message.vip, .message.sub, .message.mod {
    padding-left: 1rem;
}

.message.vip {
    border-left: 20px solid #00ff00;
}

.message.sub {
    border-left: 20px solid #fff;
}

.message.mod {
    border-left: 20px solid purple;
}

.message.read {
    color: #444;
}

#chat .username, #grasp .username, #picks .username {
    font-size: .7em;
    color: #888;
    font-weight: bold;
}

/* Animation.css customization */
:root {
    --animate-duration: 210ms;
}
</style>
