<template>
    <div
        id="links"
        class="box"
        :class="{ multiple: multiple }"
    >
        <h2>Hyperlinks</h2>
        <div
            v-for="(counter, link) of links"
            :key="link"
            class="link-holder"
        >
            <div v-if="counter > 1">
                <span>{{ counter }}</span>
            </div>
            <a target="_blank" :href="link">{{ prettifyLink(link) }}</a>
        </div>
    </div>
</template>

<script>
export default {
    name: 'LinkList',
    props: {
        links: Object,
        multiple: Boolean
    },
    methods: {
        prettifyLink: function(link) {
            if(link.startsWith('http')) {
                return link.replace(/(^\w+:|^)\/\//, '');
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
    width: 35%;
    min-width: 320px;
    height: 92vh;
    overflow-y: scroll;
    background: rgba(0, 0, 0, .8);
    margin-top: 3rem;
    padding: 0 .8rem;
}

#links.multple {
    padding: 0 2.5rem 0 .8rem;
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

#links.multiple > .link-holder {
    margin-left: 1.5rem;
}

.link-holder > div {
    position: absolute;
    left: 14px;
    font-size: .7rem;
    font-weight: bold;
    background: var(--mod-color);
    padding: .15rem .3rem;
    line-height: .9rem;
    margin-top: .3rem;
    border-radius: .2rem;
}
</style>
