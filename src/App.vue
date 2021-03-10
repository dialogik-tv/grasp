<template>
    <settings-panel :filter="filter" @lock="filter.locked = $event"></settings-panel>
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
import TwitchJs from 'twitch-js';
import '../node_modules/animate.css/animate.min.css';

import SettingsPanel from './components/SettingsPanel.vue';
import ChatList from './components/ChatList.vue';
import GraspList from './components/GraspList.vue';
import PickList from './components/PickList.vue';
import UserList from './components/UserList.vue';

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
            langData: ["hi", "hey"]
        }
    },
    created() {
        // Parse URL param
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        
        // Parse channel parameter
        if(urlParams.has('channel')) {
            this.config.channel = urlParams.get('channel');
        }
        
        // Parse language parameter
        if(urlParams.has('lang')) {
            // Define allowed/defined language sets
            const allowedLanguages = ['de', 'en', 'fr', 'es', 'it', 'pl'];

            // Parse URL parameters into array
            const paramLangs = urlParams.get('lang').split('|');

            // Add language if allowed and not already in the array
            for(const lang of paramLangs) {
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
        
        // Fetch language packs and compile
        for(const lang of this.langs) {
            // console.log('Fetching lang packages for langs', this.langs);
            fetch(`https://raw.githubusercontent.com/dialogik-tv/grasp-lang/master/lang/lang.${lang}.json`)
                .then(response => response.json())
                .then(data => {
                    // Merge lang data arrays (remove duplicates before concating)
                    this.langData = this.langData.concat(data.filter((item) => this.langData.indexOf(item) < 0))
                    return;
                });
        }

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
        sanitizeMessage(message) {
            message = message.replace(/(<([^>]+)>)/ig, '').trim();
            if(message.length < 1) {
                message = '&lt;/&gt;';
            }
            return message;
        },
        removeDiacritics(str) {
            const defaultDiacriticsRemovalMap = [
                {'base':'A', 'letters':/[\u0041\u24B6\uFF21\u00C0\u00C1\u00C2\u1EA6\u1EA4\u1EAA\u1EA8\u00C3\u0100\u0102\u1EB0\u1EAE\u1EB4\u1EB2\u0226\u01E0\u00C4\u01DE\u1EA2\u00C5\u01FA\u01CD\u0200\u0202\u1EA0\u1EAC\u1EB6\u1E00\u0104\u023A\u2C6F]/g},
                {'base':'AA','letters':/[\uA732]/g},
                {'base':'AE','letters':/[\u00C6\u01FC\u01E2]/g},
                {'base':'AO','letters':/[\uA734]/g},
                {'base':'AU','letters':/[\uA736]/g},
                {'base':'AV','letters':/[\uA738\uA73A]/g},
                {'base':'AY','letters':/[\uA73C]/g},
                {'base':'B', 'letters':/[\u0042\u24B7\uFF22\u1E02\u1E04\u1E06\u0243\u0182\u0181]/g},
                {'base':'C', 'letters':/[\u0043\u24B8\uFF23\u0106\u0108\u010A\u010C\u00C7\u1E08\u0187\u023B\uA73E]/g},
                {'base':'D', 'letters':/[\u0044\u24B9\uFF24\u1E0A\u010E\u1E0C\u1E10\u1E12\u1E0E\u0110\u018B\u018A\u0189\uA779]/g},
                {'base':'DZ','letters':/[\u01F1\u01C4]/g},
                {'base':'Dz','letters':/[\u01F2\u01C5]/g},
                {'base':'E', 'letters':/[\u0045\u24BA\uFF25\u00C8\u00C9\u00CA\u1EC0\u1EBE\u1EC4\u1EC2\u1EBC\u0112\u1E14\u1E16\u0114\u0116\u00CB\u1EBA\u011A\u0204\u0206\u1EB8\u1EC6\u0228\u1E1C\u0118\u1E18\u1E1A\u0190\u018E]/g},
                {'base':'F', 'letters':/[\u0046\u24BB\uFF26\u1E1E\u0191\uA77B]/g},
                {'base':'G', 'letters':/[\u0047\u24BC\uFF27\u01F4\u011C\u1E20\u011E\u0120\u01E6\u0122\u01E4\u0193\uA7A0\uA77D\uA77E]/g},
                {'base':'H', 'letters':/[\u0048\u24BD\uFF28\u0124\u1E22\u1E26\u021E\u1E24\u1E28\u1E2A\u0126\u2C67\u2C75\uA78D]/g},
                {'base':'I', 'letters':/[\u0049\u24BE\uFF29\u00CC\u00CD\u00CE\u0128\u012A\u012C\u0130\u00CF\u1E2E\u1EC8\u01CF\u0208\u020A\u1ECA\u012E\u1E2C\u0197]/g},
                {'base':'J', 'letters':/[\u004A\u24BF\uFF2A\u0134\u0248]/g},
                {'base':'K', 'letters':/[\u004B\u24C0\uFF2B\u1E30\u01E8\u1E32\u0136\u1E34\u0198\u2C69\uA740\uA742\uA744\uA7A2]/g},
                {'base':'L', 'letters':/[\u004C\u24C1\uFF2C\u013F\u0139\u013D\u1E36\u1E38\u013B\u1E3C\u1E3A\u0141\u023D\u2C62\u2C60\uA748\uA746\uA780]/g},
                {'base':'LJ','letters':/[\u01C7]/g},
                {'base':'Lj','letters':/[\u01C8]/g},
                {'base':'M', 'letters':/[\u004D\u24C2\uFF2D\u1E3E\u1E40\u1E42\u2C6E\u019C]/g},
                {'base':'N', 'letters':/[\u004E\u24C3\uFF2E\u01F8\u0143\u00D1\u1E44\u0147\u1E46\u0145\u1E4A\u1E48\u0220\u019D\uA790\uA7A4]/g},
                {'base':'NJ','letters':/[\u01CA]/g},
                {'base':'Nj','letters':/[\u01CB]/g},
                {'base':'O', 'letters':/[\u004F\u24C4\uFF2F\u00D2\u00D3\u00D4\u1ED2\u1ED0\u1ED6\u1ED4\u00D5\u1E4C\u022C\u1E4E\u014C\u1E50\u1E52\u014E\u022E\u0230\u00D6\u022A\u1ECE\u0150\u01D1\u020C\u020E\u01A0\u1EDC\u1EDA\u1EE0\u1EDE\u1EE2\u1ECC\u1ED8\u01EA\u01EC\u00D8\u01FE\u0186\u019F\uA74A\uA74C]/g},
                {'base':'OI','letters':/[\u01A2]/g},
                {'base':'OO','letters':/[\uA74E]/g},
                {'base':'OU','letters':/[\u0222]/g},
                {'base':'P', 'letters':/[\u0050\u24C5\uFF30\u1E54\u1E56\u01A4\u2C63\uA750\uA752\uA754]/g},
                {'base':'Q', 'letters':/[\u0051\u24C6\uFF31\uA756\uA758\u024A]/g},
                {'base':'R', 'letters':/[\u0052\u24C7\uFF32\u0154\u1E58\u0158\u0210\u0212\u1E5A\u1E5C\u0156\u1E5E\u024C\u2C64\uA75A\uA7A6\uA782]/g},
                {'base':'S', 'letters':/[\u0053\u24C8\uFF33\u1E9E\u015A\u1E64\u015C\u1E60\u0160\u1E66\u1E62\u1E68\u0218\u015E\u2C7E\uA7A8\uA784]/g},
                {'base':'T', 'letters':/[\u0054\u24C9\uFF34\u1E6A\u0164\u1E6C\u021A\u0162\u1E70\u1E6E\u0166\u01AC\u01AE\u023E\uA786]/g},
                {'base':'TZ','letters':/[\uA728]/g},
                {'base':'U', 'letters':/[\u0055\u24CA\uFF35\u00D9\u00DA\u00DB\u0168\u1E78\u016A\u1E7A\u016C\u00DC\u01DB\u01D7\u01D5\u01D9\u1EE6\u016E\u0170\u01D3\u0214\u0216\u01AF\u1EEA\u1EE8\u1EEE\u1EEC\u1EF0\u1EE4\u1E72\u0172\u1E76\u1E74\u0244]/g},
                {'base':'V', 'letters':/[\u0056\u24CB\uFF36\u1E7C\u1E7E\u01B2\uA75E\u0245]/g},
                {'base':'VY','letters':/[\uA760]/g},
                {'base':'W', 'letters':/[\u0057\u24CC\uFF37\u1E80\u1E82\u0174\u1E86\u1E84\u1E88\u2C72]/g},
                {'base':'X', 'letters':/[\u0058\u24CD\uFF38\u1E8A\u1E8C]/g},
                {'base':'Y', 'letters':/[\u0059\u24CE\uFF39\u1EF2\u00DD\u0176\u1EF8\u0232\u1E8E\u0178\u1EF6\u1EF4\u01B3\u024E\u1EFE]/g},
                {'base':'Z', 'letters':/[\u005A\u24CF\uFF3A\u0179\u1E90\u017B\u017D\u1E92\u1E94\u01B5\u0224\u2C7F\u2C6B\uA762]/g},
                {'base':'a', 'letters':/[\u0061\u24D0\uFF41\u1E9A\u00E0\u00E1\u00E2\u1EA7\u1EA5\u1EAB\u1EA9\u00E3\u0101\u0103\u1EB1\u1EAF\u1EB5\u1EB3\u0227\u01E1\u00E4\u01DF\u1EA3\u00E5\u01FB\u01CE\u0201\u0203\u1EA1\u1EAD\u1EB7\u1E01\u0105\u2C65\u0250]/g},
                {'base':'aa','letters':/[\uA733]/g},
                {'base':'ae','letters':/[\u00E6\u01FD\u01E3]/g},
                {'base':'ao','letters':/[\uA735]/g},
                {'base':'au','letters':/[\uA737]/g},
                {'base':'av','letters':/[\uA739\uA73B]/g},
                {'base':'ay','letters':/[\uA73D]/g},
                {'base':'b', 'letters':/[\u0062\u24D1\uFF42\u1E03\u1E05\u1E07\u0180\u0183\u0253]/g},
                {'base':'c', 'letters':/[\u0063\u24D2\uFF43\u0107\u0109\u010B\u010D\u00E7\u1E09\u0188\u023C\uA73F\u2184]/g},
                {'base':'d', 'letters':/[\u0064\u24D3\uFF44\u1E0B\u010F\u1E0D\u1E11\u1E13\u1E0F\u0111\u018C\u0256\u0257\uA77A]/g},
                {'base':'dz','letters':/[\u01F3\u01C6]/g},
                {'base':'e', 'letters':/[\u0065\u24D4\uFF45\u00E8\u00E9\u00EA\u1EC1\u1EBF\u1EC5\u1EC3\u1EBD\u0113\u1E15\u1E17\u0115\u0117\u00EB\u1EBB\u011B\u0205\u0207\u1EB9\u1EC7\u0229\u1E1D\u0119\u1E19\u1E1B\u0247\u025B\u01DD]/g},
                {'base':'f', 'letters':/[\u0066\u24D5\uFF46\u1E1F\u0192\uA77C]/g},
                {'base':'g', 'letters':/[\u0067\u24D6\uFF47\u01F5\u011D\u1E21\u011F\u0121\u01E7\u0123\u01E5\u0260\uA7A1\u1D79\uA77F]/g},
                {'base':'h', 'letters':/[\u0068\u24D7\uFF48\u0125\u1E23\u1E27\u021F\u1E25\u1E29\u1E2B\u1E96\u0127\u2C68\u2C76\u0265]/g},
                {'base':'hv','letters':/[\u0195]/g},
                {'base':'i', 'letters':/[\u0069\u24D8\uFF49\u00EC\u00ED\u00EE\u0129\u012B\u012D\u00EF\u1E2F\u1EC9\u01D0\u0209\u020B\u1ECB\u012F\u1E2D\u0268\u0131]/g},
                {'base':'j', 'letters':/[\u006A\u24D9\uFF4A\u0135\u01F0\u0249]/g},
                {'base':'k', 'letters':/[\u006B\u24DA\uFF4B\u1E31\u01E9\u1E33\u0137\u1E35\u0199\u2C6A\uA741\uA743\uA745\uA7A3]/g},
                {'base':'l', 'letters':/[\u006C\u24DB\uFF4C\u0140\u013A\u013E\u1E37\u1E39\u013C\u1E3D\u1E3B\u017F\u0142\u019A\u026B\u2C61\uA749\uA781\uA747]/g},
                {'base':'lj','letters':/[\u01C9]/g},
                {'base':'m', 'letters':/[\u006D\u24DC\uFF4D\u1E3F\u1E41\u1E43\u0271\u026F]/g},
                {'base':'n', 'letters':/[\u006E\u24DD\uFF4E\u01F9\u0144\u00F1\u1E45\u0148\u1E47\u0146\u1E4B\u1E49\u019E\u0272\u0149\uA791\uA7A5]/g},
                {'base':'nj','letters':/[\u01CC]/g},
                {'base':'o', 'letters':/[\u006F\u24DE\uFF4F\u00F2\u00F3\u00F4\u1ED3\u1ED1\u1ED7\u1ED5\u00F5\u1E4D\u022D\u1E4F\u014D\u1E51\u1E53\u014F\u022F\u0231\u00F6\u022B\u1ECF\u0151\u01D2\u020D\u020F\u01A1\u1EDD\u1EDB\u1EE1\u1EDF\u1EE3\u1ECD\u1ED9\u01EB\u01ED\u00F8\u01FF\u0254\uA74B\uA74D\u0275]/g},
                {'base':'oi','letters':/[\u01A3]/g},
                {'base':'ou','letters':/[\u0223]/g},
                {'base':'oo','letters':/[\uA74F]/g},
                {'base':'p','letters':/[\u0070\u24DF\uFF50\u1E55\u1E57\u01A5\u1D7D\uA751\uA753\uA755]/g},
                {'base':'q','letters':/[\u0071\u24E0\uFF51\u024B\uA757\uA759]/g},
                {'base':'r','letters':/[\u0072\u24E1\uFF52\u0155\u1E59\u0159\u0211\u0213\u1E5B\u1E5D\u0157\u1E5F\u024D\u027D\uA75B\uA7A7\uA783]/g},
                {'base':'s','letters':/[\u0073\u24E2\uFF53\u00DF\u015B\u1E65\u015D\u1E61\u0161\u1E67\u1E63\u1E69\u0219\u015F\u023F\uA7A9\uA785\u1E9B]/g},
                {'base':'t','letters':/[\u0074\u24E3\uFF54\u1E6B\u1E97\u0165\u1E6D\u021B\u0163\u1E71\u1E6F\u0167\u01AD\u0288\u2C66\uA787]/g},
                {'base':'tz','letters':/[\uA729]/g},
                {'base':'u','letters':/[\u0075\u24E4\uFF55\u00F9\u00FA\u00FB\u0169\u1E79\u016B\u1E7B\u016D\u00FC\u01DC\u01D8\u01D6\u01DA\u1EE7\u016F\u0171\u01D4\u0215\u0217\u01B0\u1EEB\u1EE9\u1EEF\u1EED\u1EF1\u1EE5\u1E73\u0173\u1E77\u1E75\u0289]/g},
                {'base':'v','letters':/[\u0076\u24E5\uFF56\u1E7D\u1E7F\u028B\uA75F\u028C]/g},
                {'base':'vy','letters':/[\uA761]/g},
                {'base':'w','letters':/[\u0077\u24E6\uFF57\u1E81\u1E83\u0175\u1E87\u1E85\u1E98\u1E89\u2C73]/g},
                {'base':'x','letters':/[\u0078\u24E7\uFF58\u1E8B\u1E8D]/g},
                {'base':'y','letters':/[\u0079\u24E8\uFF59\u1EF3\u00FD\u0177\u1EF9\u0233\u1E8F\u00FF\u1EF7\u1E99\u1EF5\u01B4\u024F\u1EFF]/g},
                {'base':'z','letters':/[\u007A\u24E9\uFF5A\u017A\u1E91\u017C\u017E\u1E93\u1E95\u01B6\u0225\u0240\u2C6C\uA763]/g}
            ];

            for(var i=0; i<defaultDiacriticsRemovalMap.length; i++) {
                str = str.replace(defaultDiacriticsRemovalMap[i].letters, defaultDiacriticsRemovalMap[i].base);
            }

            return str;
        },
        searchNeedles: function(haystack) {
            const sanitized = this.removeDiacritics(haystack.toLowerCase())
                                .replace(/[^a-z\s]/gi, '');
            let regex = null;
            for(const needle of this.langData) {
                // Escape literals \^$.|?*+()[]{} so they're regexpable
                const escapedNeedle = needle.toLowerCase()
                                        .replace(/\\|\^|\$|\.|\||\?|\*|\+|\(|\)|\[|\]|\{|\}/g, function(x) {
                    return '\\' + x;
                });
                regex = new RegExp(`\\b${escapedNeedle}\\b`, 'g');
                if(sanitized.search(regex) > -1) {
                    return true;
                }
            }
            return false;
        },
        searchShorties: function(message) {
            const sanitized = this.removeDiacritics(message.toLowerCase())
                                .replace(/[^a-z\s]/gi, '');
            for(const word of this.langData) {
                if(word == sanitized) {
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

            // Remove any HTML tags – and skip message if there is no content left
            message.message = this.sanitizeMessage(message.message);

            // console.log('[Message] Incoming message', {message});

            // Add user to list or increase count
            message.username = message.tags.username = message.tags.displayName; // Hack for nicer usernames
            if(!Object.prototype.hasOwnProperty.call(this.users, message.tags.userId)) {
                let user = {
                    ...message.tags,
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
                    vip: false,
                    redemption: false
                }
            }

            // Let's make sure this is not a message addressed to someone else
            if(
                message.message.startsWith('@')
                && !message.message.toLowerCase().startsWith(`@${this.config.channel.toLowerCase()}`)
                && !message.message.toLowerCase().includes(`@${this.config.channel.toLowerCase()}`)
            ) {
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
            if(this.searchShorties(message.message)) {
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
            
            // Is input text of a redemption?
            if(message.tags.customRewardId) {
                grasp.details.redemption = true;
                grasp.isGrasp = true;
            }

            return grasp;
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
    padding-right: 1.3rem;
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
    border: 1px solid red;
    overflow: hidden;
    /* order: 2; */
}

.message > .meta > .timestamp {
    flex: 1 1 auto;
    text-align: right;
    white-space: nowrap;
    border: 1px solid green;
    /* order: 1; */
}

.message > .body {
    overflow-x: hidden;
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
    opacity: .6;
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
