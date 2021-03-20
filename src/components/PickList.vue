<template>
  <button v-on:click="savePicks">test</button>
  <a href="" hidden="true" id="downloadlink" ref="csvfiledownload">download</a>
  <transition-group id="picks" class="box" name="list" tag="div">
    <!-- 
        enter-active-class="animate__animated animate__slideInLeft"
        leave-active-class="animate__animated animate__slideOutRight"
    -->
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
  </transition-group>
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
  },
  data() {
    return {
      isSaved: false,
      savedPicks: [],
    };
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
    setSaveState(newFiltered) {
      this.isSaved =
        newFiltered.filter((x) => {
          return this.savedPicks.indexOf(x) === -1;
        }).length === 0;
      if (!this.isSaved) {
        this.savedPicks = newFiltered;
      }
    },
    savePicks() {
      if (this.isSaved) {
        return;
      }
      this.isSaved = true;
      const date = new Date(Date.now());
      const fileName = date.toISOString()+'_'+this.savedPicks[0].channel;
      const fileExtention = '.json';
      const data =
        "data:text/json;charset=utf-8," +
        encodeURIComponent(JSON.stringify(this.savedPicks));

      const elem = document.getElementById("downloadlink");
      elem.setAttribute("href", data);
      elem.setAttribute("download", fileName+fileExtention);
      elem.click();
    },
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
