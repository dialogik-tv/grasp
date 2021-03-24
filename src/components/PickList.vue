<template>
    <!-- placeholder for FileDownload -->
    <a href="" hidden="true" id="downloadlink">download</a>
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
        <chat-message
            :message="message.message"
            :emotes="message.tags.emotes"
        ></chat-message>
    </div>
</template>

<script>
import moment from "moment";
import ChatMessage from "./ChatMessage.vue";

export default {
    name: "PickList",
    components: {
        ChatMessage,
    },
    props: {
        picks: Array,
        filter: Object,
        savePickedEventHandler: String,
    },
    data() {
        return {
            isSaved: false,
            savedPicks: [],
        };
    },
    watch: {
        savePickedEventHandler() {
            this.savePicks();
        },
    },
    created() {
        window.addEventListener("beforeunload", this.closeHandler);
    },
    computed: {
        filteredPicks() {
            const filter = this.filter;
            const filtered = this.picks.filter(function (message) {
                return (
                    // Filter all picks
                    message.pick === true &&
                    // Filter by username string (if any given)
                    message.username.toLowerCase().includes(filter.username.toLowerCase())
                );
            });
            this.setSaveState(filtered);
            return filtered;
        },
    },
    methods: {
        moment: function (date) {
            return moment(date).startOf("minute").fromNow();
        },
        // set isSaved to false, when there are untracked changes.
        // saves the changes in savedPicks and sets the flag isSaved to false when the newFiltered array contains elements
        setSaveState(newFiltered) {
            if (!this.checkArraysAreEqual(newFiltered, this.savedPicks, false)) {
                this.isSaved = newFiltered.length === 0 ? true : false;
                this.savedPicks = newFiltered;
            }
        },
        // Creates a File with the current savedPicks as JSON, content could be mapped to be smaller and only contains some
        // Informations like userId, message, timestamp.
        // Parsing all informations into JSON enables an easier reimport later on.
        savePicks() {
            this.isSaved = true;
            const date = new Date(Date.now()); // needs to be a Date-Object lol
            const fileName =
                date.toISOString() + "_" + this.savedPicks[0].channel + ".json";
            const data =
                "data:text/json;charset=utf-8," +
                encodeURIComponent(JSON.stringify(this.savedPicks));
            const elem = document.getElementById("downloadlink");
            elem.setAttribute("href", data);
            elem.setAttribute("download", fileName);
            elem.click();
        },
        checkArraysAreEqual(arrA, arrB, includeOrder = false) {
            //Arrays with different length arent equal ;)
            if (arrA.length !== arrB.length) {
                return false;
            }
            for (let i = arrA.length; i--; ) {
                if (includeOrder) {
                    // Index ArrayA != Index Array B => Not Equal
                    if (arrA[i] !== arrB[i]) {
                        return false;
                    }
                } else {
                    // order doesnt matter
                    // array.some() === true if one element meets the condition
                    if (!arrB.some((x) => x === arrA[i])) {
                        return false;
                    }
                }
            }
            return true;
        },
        // closeEvent.returnValue != '' to prompt the Browser that there are unsaved changes
        closeHandler(event) {
            if (this.isSaved) {
                return;
            }
            event.returnValue = "Not saved!";
        },
    },
};
</script>

<style scoped>
</style>
