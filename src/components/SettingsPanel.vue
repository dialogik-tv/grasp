<template>
    <div class="settings">
        <input
            v-model="filterSettings.username"
            @click.ctrl="filterSettings.username = ''"
        >
        <input
            type="checkbox"
            id="mod"
            value="mod"
            v-model="filterSettings.mod"
        /> Mod
        <input
            type="checkbox"
            id="sub"
            value="sub"
            v-model="filterSettings.sub"
        /> Sub
        <input
            type="checkbox"
            id="vip"
            value="vip"
            v-model="filterSettings.vip"
        /> VIP
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
    }
}
</script>

<style scoped>
</style>
