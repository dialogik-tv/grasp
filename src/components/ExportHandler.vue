<template>
    <div>
        <!-- placeholder for FileDownload -->
        <a href="" hidden="true" id="downloadlink">download</a>
    </div>
</template>

<script>
export default {
    name: "ExportHandler",
    props: {
        picks: Array,
        channel: String,
        links: Object,
        savePickedEventHandler: String,
    },
    watch: {
        savePickedEventHandler() {
            this.savePicks();
        },
    },
    computed: {
        pickList() {
            // Filter all picks
            return this.picks.filter(function(message) {
                return (message.pick === true);
            });
        },
        linkList() {
            return Object.keys(this.links);
        }
    },
    methods: {
        // Creates a File with the current pickList as JSON, content could be mapped to be smaller and only contains some
        // Informations like userId, message, timestamp.
        // Parsing all informations into JSON enables an easier reimport later on.
        savePicks() {
            const date = new Date(Date.now()); // needs to be a Date-Object lol

            const year    = date.getFullYear();
            const month   = (date.getMonth() + 1).toString().length > 1 ? date.getMonth() + 1 : "0" + (date.getMonth() + 1);
            const day     = date.getDate().toString().length > 1 ? date.getDate() : "0" + date.getDate();
            const hours   = date.getHours().toString().length > 1 ? date.getHours() : "0" + date.getHours();
            const minutes = date.getMinutes().toString().length > 1 ? date.getMinutes() : "0" + date.getMinutes();
            
            // Build date string
            const dateString = year + month + day + "-" + hours + minutes;

            // Build filename
            const fileName = dateString + "-" + this.channel + ".json";

            // Add data to (temporary) file
            const data =
                "data:text/json;charset=utf-8," +
                encodeURIComponent(JSON.stringify({
                    "picks": this.pickList,
                    "links": this.linkList
                }));
            const elem = document.getElementById("downloadlink");
            elem.setAttribute("href", data);
            elem.setAttribute("download", fileName);
            elem.click();
        }
    },
};
</script>