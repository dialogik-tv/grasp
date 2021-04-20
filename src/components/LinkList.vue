<template>
    <div
        id="links"
        class="box"
    >
        <h2>Hyperlinks</h2>
        <div
            v-for="link of links"
            :key="link"
            class="link-holder"
        >
            <a target="_blank" :href="getUrl(link)">{{ link }}</a>
        </div>
    </div>
</template>

<script>
export default {
    name: 'LinkList',
    props: {
        links: Array
    },
    methods: {
        getUrl: function(link) {
            if(link.startsWith('http')) {
                return link;
            } else {
                return `https://${link}`;
            }
        }
    }
}
</script>

<style scoped>
#links {
    position: fixed;
    top: 0;
    right: 0;
    width: 20%;
    min-width: 320px;
    height: 90vh;
    overflow-y: scroll;
    background: rgba(0, 0, 0, .8);
    padding: 0 1rem;
    margin-top: 5rem;
}

#links::-webkit-scrollbar {
    width: 6px;
    height: 6px;
}
#links::-webkit-scrollbar-thumb {
    background: #222;
    border-radius: 3px;
}
#links::-webkit-scrollbar-thumb:hover {
    background: #444;
}
#links::-webkit-scrollbar-track {
    background: #000;
    border-radius: 3px;
}

.link-holder {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1.8rem;
    margin-left: .5rem;
}
</style>
