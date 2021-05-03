<template>
    <settings-panel :filter="filter" @lock="filter.locked = $event"></settings-panel>
    <div id="dashboard" :class="{ reverse: config.reverse }">
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
        v-if="visible.users"
        :users="users"
        :filter="filter"
        @filterUsername="this.filter.username = $event"
    ></user-list>
    <link-list
        v-if="visible.links"
        :links="links"
        :multiple="multipleLinks"
    ></link-list>
</template>

<script>
import TwitchJs from 'twitch-js';
import getUrls from 'get-urls';
import Message from './lib/Message.js';
import Grasp from './lib/Grasp.js';

import SettingsPanel from './components/SettingsPanel.vue';
import ChatList from './components/ChatList.vue';
import GraspList from './components/GraspList.vue';
import PickList from './components/PickList.vue';
import UserList from './components/UserList.vue';
import LinkList from './components/LinkList.vue';

export default {
    name: 'App',
    components: {
        SettingsPanel,
        ChatList,
        GraspList,
        PickList,
        UserList,
        LinkList
    },
    data() {
        return {
            config: {
                channel: 'dialogikTV',
                reverse: false
            },
            chat: [],
            users: {},
            links: {},
            multipleLinks: false,
            visible: {
                chat: true,
                users: false,
                links: false
            },
            filter: {
                username: '',
                locked: false,
                mention: true,
                chatcount: true,
                mod: false,
                sub: false,
                vip: false,
                haystack: true,
                shorty: true
            },
            langs: [],
            langData: ["hi", "hey"],
            grasp: {}
        }
    },
    async created() {
        // Parse URL param
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        
        // Parse channel parameter
        if(urlParams.has('channel')) {
            this.config.channel = urlParams.get('channel');
        }
        
        // Parse channel parameter
        if(urlParams.has('reverse')) {
            if(urlParams.get('reverse') === 'true' || urlParams.get('reverse') === '1') {
                this.config.reverse = true;
            }
        }
        
        // Parse language parameter
        if(urlParams.has('lang')) {
            // Define allowed/defined language sets
            const allowedLanguages = ['de', 'en', 'fr', 'es', 'it', 'pl'];

            // Parse URL parameters into array
            const paramLangs = urlParams.get('lang').split('|');

            // Add language if allowed and not already in the array
            for(let lang of paramLangs) {
                if(allowedLanguages.indexOf(lang) > -1 && this.langs.indexOf(lang) < 0) {
                    this.langs.push(lang);
                } else {
                    // Tell user about unsupported languages
                    if(allowedLanguages.indexOf(lang) < 0) {
                        alert(`Language [${lang.toUpperCase()}] not supported. Skipping!`);
                    }
                }
            }
        }

        // Set default lang (de) if no language given
        if(this.langs.length < 1) {
            this.langs.push('de');
        }

        await this.fetchLanguageData();

        // Add target channel to page title
        document.title = `grasping #${this.config.channel}`;

        // Add keyboard shortcuts
        const filter = this.filter;
        const visible = this.visible;
        window.addEventListener("keyup", function(event) {
            // If focused to input username search field:
            // quit now to avoid unwanted behaviour
            if(filter.locked === true) {
                return;
            }

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
                    // [C] - Toggle chat (but not ctrl+c!)
                    if(!event.ctrlKey) {
                        visible.chat = !visible.chat;
                    }
                    break;
                case "u":
                    // [U] - Toggle users
                    visible.users = !visible.users;
                    break;
                case "l":
                    // [l] - Toggle link list
                    visible.links = !visible.links;
                    break;
                default:
                    return; // Quit when this doesn't handle the key event.
            }
            // Cancel the default action to avoid it being handled twice
            event.preventDefault();
        }, true);
        // the last option dispatches the event to the listener first,
        // then dispatches event to window

        // Inizialize Grasp instance
        this.grasp = new Grasp(this.config.channel, this.langData);

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
    watch: {
        'visible.users': function(newFilter) {
            if(newFilter) {
                this.visible.links = false;
            }
        },
        'visible.links': function(newFilter) {
            if(newFilter) {
                this.visible.users = false;
            }
        }
    },
    methods: {
        handleMessage: function(input) {
            // Only handle user chat messages (no tech stuff)
            if(input.event != 'PRIVMSG') {
                // console.log(message);
                return;
            }
            
            // Skip if no message user or content (smells like no user chat message)
            if(typeof input.message == 'undefined' || typeof input.username == 'undefined') {
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
            if(chatbots.includes(input.username.toLowerCase())) {
                return;
            }

            // console.log('[Message] Incoming message', {input});

            try {
                // Add user to list or increase count
                input.username = input.tags.username = input.tags.displayName; // Hack for nicer usernames
                if(!Object.prototype.hasOwnProperty.call(this.users, input.tags.userId)) {
                    let user = {
                        userId: input.tags.userId,
                        badges: input.tags.badges,
                        username: input.username,
                        chatcount: 1
                    };
                    this.users[input.tags.userId] = user;
                    // console.log('[Users] User added', {user}, {users});
                } else {
                    this.users[input.tags.userId].chatcount++;
                }

                // Check message for hyperlinks
                let urls = getUrls(input.message, {
                    defaultProtocol: 'https:',
                    forceHttps: true,
                    stripWWW: false
                });
                for(let url of urls) {
                    if(url in this.links) {
                        this.multipleLinks = true;
                        this.links[url]++;
                    } else {
                        this.links[url] = 1;
                    }
                }
                
                let message = new Message(input);

                // Grasp the grasp out of the Twitch chat!
                const report = this.grasp.grasp(input, this.users[input.tags.userId].chatcount, this.config.channel);
                message.grasp = report;

                // Add message to chat
                this.chat.unshift(message);
            } catch(e) {
                console.error('Error in message handler', e);
            }
        },
        fetchLanguageData: async function() {
            // Fetch language packs and compile
            for(let lang of this.langs) {
                await fetch(`https://raw.githubusercontent.com/dialogik-tv/grasp-lang/master/lang/lang.${lang}.json`)
                    .then(response => response.json())
                    .then(data => {
                        // Merge lang data arrays (remove duplicates before concating)
                        this.langData = this.langData.concat(data.filter((item) => this.langData.indexOf(item) < 0))
                        return;
                    });
            }
        }
    }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css2?family=Fira+Code&display=swap');

/* Reset CSS */
*, *::before, *::after {
    box-sizing: border-box;
}

:root {
    --min-width: 420;
    --min-width-px: 420px;
    --max-width: 1920;
    --min-font: 16;
    --min-font-px: 16px;
    --max-font: 20;
}

body {
    font-size: calc(var(--min-font-px) + (var(--max-font) - var(--min-font)) * ((100vw - var(--min-width-px)) / (var(--max-width) - var(--min-width))));
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
    color: var(--mention-color);
    text-decoration: none;
}
a:hover {
    border-bottom: 1px solid var(--mention-color);
}

/* See https://1linelayouts.glitch.me/ #7 */
#dashboard {
    display: grid;
    grid-gap: 1rem;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    margin-top: .4rem;
}
.box {
    /* font-size: 1.3rem; */
    padding: 0;
    padding-right: 1rem;
    align-items: stretch;
    text-align: left;
}

/* CSS styles for ChatList, GraspList and PickList */
.message-list {
    height: 94vh;
    overflow-x: hidden;
    overflow-y: scroll;
    padding-top: 1rem;
    padding-right: 1rem;
}
#grasp.message-list {
    padding-right: 1.3rem; /* correction for .count box */
}

#dashboard.reverse .message-list {
    display: flex;
    flex-direction: column-reverse;
}

.message-list::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}
.message-list::-webkit-scrollbar-thumb {
    background-color: #222;
    border-radius: 3px;
}
.message-list::-webkit-scrollbar-thumb:hover {
    background-color: var(--text-gray-color);
}
.message-list::-webkit-scrollbar-track {
    background-color: #000;
    border-radius: 3px;
}

.message {
    margin-bottom: 1rem;
    background-color: var(--background-color);
    padding: .6rem;
    border-left: var(--message-border-width) solid var(--background-color);
    border-right: var(--message-border-width) solid var(--background-color);
    cursor: pointer;
}

.message > .meta {
    display: flex;
    flex-wrap: wrap;
    margin-bottom: .5rem;
    /* flex-direction: column-reverse; */
    column-gap: .5em;
}

.message.first > .meta,
.message.second > .meta {
    margin-bottom: 1.5rem;
}

.message > .meta > .username {
    flex: 0 1 auto;
    overflow-x: hidden;
    text-overflow: ellipsis;
}

.message > .meta > .timestamp {
    flex: 1 1 auto;
    text-align: right;
    white-space: nowrap;
}

.message > .body {
    overflow-x: hidden;
    text-overflow: ellipsis;
}

.message .timestamp {
    color: var(--text-gray-color);
    font-size: .8rem;
}

.message.vip {
    border-left: var(--message-border-width) solid var(--vip-color);
}

.message.sub {
    border-left: var(--message-border-width) solid var(--sub-color);
}

.message.mod {
    border-left: var(--message-border-width) solid var(--mod-color);
}

.message.read {
    opacity: .4;
    color: var(--text-gray-color);
}

.message.redemption {
    border-right: var(--message-border-width) solid var(--redemption-color);
}

.message.redemption.read {
    border-right: var(--message-border-width) solid var(--redemption-read-color);
}

div:not(#userlist) .username {
    font-size: .7em;
    color: var(--text-gray-color);
    font-weight: bold;
}

/* #chat .message.redemption .username,
#grasp .message.redemption .username,
#chat .message.redemption .timestamp,
#grasp .message.redemption .timestamp {
    color: var(--username-dark-color);
} */

:root {
    /* Colors */
    --background-color: #1b1b1b;
    --background-light-color: #888;
    --text-gray-color: #444;
    --text-color: #fff;
    --first-color: #00acee57;
    --second-color: #00acee20;
    --mod-color: purple;
    --mod-light-color: rgba(128,0,128,.15);
    --vip-color: #00ff00;
    --sub-color: #ffffff;
    --mention-color: #00acee;
    --haystack-color: yellow;
    --redemption-color: #ff5e00;
    --redemption-read-color: #ff5e0057;
    --username-dark-color: #444;
    --username-color: #ccc;
    
    /* Widths */
    --message-border-width: .5rem;
}

/* Responsiveness */
/* @media (max-width: 420px) {
    .message > .body {
        font-size: 1rem;
    }
} */

/*
CSS Breakpoints
@media (min-width:320px)  { smartphones, iPhone, portrait 480x320 phones }
@media (min-width:481px)  { portrait e-readers (Nook/Kindle), smaller tablets @ 600 or @ 640 wide. }
@media (min-width:641px)  { portrait tablets, portrait iPad, landscape e-readers, landscape 800x480 or 854x480 phones }
@media (min-width:961px)  { tablet, landscape iPad, lo-res laptops ands desktops }
@media (min-width:1025px) { big landscape tablets, laptops, and desktops }
@media (min-width:1281px) { hi-res laptops and desktops }
*/

/* Hide chat smartphones */
@media (max-width: 320px)  {
    #chat { display: none }
}
/* Hide picks on any small device */
@media (max-width: 641px) {
    #picks, #chat { display: none }
}

/* Always hide picks on touch devices */
@media (hover: none) and (pointer: coarse) {
    #picks { display: none }
}
</style>
