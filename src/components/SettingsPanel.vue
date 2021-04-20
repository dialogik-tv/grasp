<template>
    <div id="settings">
        <div>
            <input
                id="input-search-username"
                v-model="filterSettings.username"
                @click.ctrl="filterSettings.username = ''"
                @focus="$emit('lock', true)"
                @focusout="$emit('lock', false)"
                placeholder="Search username"
            >

            <span class="checkbox-group">
                <span class="checkbox-holder chatcount" title="Shift + C">
                    <input
                        type="checkbox"
                        id="chatcount"
                        value="chatcount"
                        v-model="filterSettings.chatcount"
                    /><label for="chatcount">Count</label>
                </span>
            </span>

            <span class="checkbox-group">
                <span class="checkbox-holder mod" title="Shift + M">
                    <input
                        type="checkbox"
                        id="mod"
                        value="mod"
                        v-model="filterSettings.mod"
                    /><label for="mod">Mod</label>
                </span>
                
                <span class="checkbox-holder sub" title="Shift + S">
                    <input
                        type="checkbox"
                        id="sub"
                        value="sub"
                        v-model="filterSettings.sub"
                    /><label for="sub">Sub</label>
                </span>
                
                <span class="checkbox-holder vip" title="Shift + V">
                    <input
                        type="checkbox"
                        id="vip"
                        value="vip"
                        v-model="filterSettings.vip"
                    /><label for="vip">VIP</label>
                </span>
            </span>
            
            <span class="checkbox-group">
                <span class="checkbox-holder mention" title="Keyboard 'M'">
                    <input
                        type="checkbox"
                        id="mention"
                        value="mention"
                        v-model="filterSettings.mention"
                    /><label for="mention">@mention</label>
                </span>
            </span>
            
            <span class="checkbox-group">
                <span class="checkbox-holder haystack" title="Shift + H">
                    <input
                        type="checkbox"
                        id="haystack"
                        value="haystack"
                        v-model="filterSettings.haystack"
                    /><label for="haystack">Haystack</label>
                </span>
                
                <span class="checkbox-holder haystack" title="Keyboard 'H'">
                    <input
                        type="checkbox"
                        id="shorty"
                        value="shorty"
                        v-model="filterSettings.shorty"
                    /><label for="shorty">Shorties</label>
                </span>
            </span>
        </div>

        <div>
            <a target="_blank" href="https://github.com/dialogik-tv/grasp#grasp-the-grasp-out-of-your-twitch-chat">Help</a>
        </div>
    </div>
</template>

<script>
export default {
    name: 'SettingsPanel',
    data() {
        return {
            filterSettings: this.filter
        }
    },
    props: {
        filter: Object
    },
    created() {
        window.addEventListener("keyup", function(event) {
            if(event.defaultPrevented) {
                return; // Do nothing if the event was already processed
            }

            switch(event.key) {
                // Shift + U
                // Focus username input search field
                case "U":
                    console.log(this);
                    break;
                default:
                    return; // Quit when this doesn't handle the key event.
            }
            // Cancel the default action to avoid it being handled twice
            event.preventDefault();
        }, true);
        // the last option dispatches the event to the listener first,
        // then dispatches event to window
    }
}
</script>

<style scoped>
#settings {
    display: flex;
    justify-content: space-between;
}

input, label {
    cursor: pointer;
}

label {
    font-weight: 900;
}

.vip { background-color: var(--vip-color); color: var(--text-gray-color); }
.sub { background-color: var(--sub-color); color: var(--text-gray-color); }
.mod { background-color: var(--mod-color); }
.mention { background-color: var(--mention-color); }
.haystack { background-color: var(--haystack-color); color: var(--text-gray-color); }

.checkbox-group {
    margin-right: 2rem;
}

.checkbox-holder {
    padding: .2rem .5rem;
}

/* Hide username search input field on small devices */
@media (max-width: 909px)  {
    input#input-search-username { display: none; }
}

/* Prettify filter settings on small devices or on touch devices, portrait mode */
@media (max-width: 320px), (orientation: portrait) and (hover: none) and (pointer: coarse) {
    .checkbox-group {
        display: block;
        margin-bottom: .7rem;
    }
    .checkbox-holder { padding-top: .3rem; padding-bottom: .3rem; }
    .chatcount { background-color: var(--text-gray-color); }

    #settings {
        background: var(--text-gray-color);
        box-sizing: border-box;
        position: fixed;
        bottom: 0;
        left: 0;
        padding: 0.8rem .7rem .3rem;
        width: 100%;
        z-index: 1000;
    }
}
</style>
