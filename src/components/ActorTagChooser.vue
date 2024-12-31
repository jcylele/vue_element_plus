<template>
    <el-container>
        <el-space direction="vertical" size="small" fill>
            <el-space direction="horizontal">
                <el-input v-model="search_text"
                          @input="onSearchTextChange"
                          placeholder="Search tags"
                          clearable/>
                <NewActorTag @tag_added="initTags"/>
            </el-space>
            <el-space v-for="tag_group in showing_tags"
                      style="border: 1px solid ; border-radius: 4px; padding: 2px"
                      direction="horizontal" :wrap="true" :size="3" alignment="stretch">

                <el-checkbox-button v-for="tag_info in tag_group"
                                    v-model="tag_info.selected"
                                    style="margin: 3px">
                    {{ tag_info.tag.tag_name }}

                </el-checkbox-button>

            </el-space>
            <!-- buttons -->
            <el-space direction="horizontal" alignment="center">
                <el-button type="primary" size="large" @click="onSubmit">
                    Save
                </el-button>
                <el-button type="warning" size="large" @click="onCancel">
                    Cancel
                </el-button>
            </el-space>

        </el-space>

    </el-container>
</template>

<script lang="ts">
import ActorTagData from "../data/ActorTagData.js";
import {mapActions, mapState} from "pinia";
import {ActorTagStore} from "../store/ActorTagStore";
import ActorData from "../data/ActorData";
import NewActorTag from "./NewActorTag.vue";

interface TagInfo {
    tag: ActorTagData,
    selected: boolean,
}

export default {
    name: "ActorTagChooser",
    props: {
        actor: ActorData
    },
    emits: ['submit', 'cancel'],
    components: {NewActorTag},
    data() {
        return {
            search_text: "",
            editing_tags: [] as TagInfo[][],
            showing_tags: [] as TagInfo[][],
        }
    },
    computed: {
        ...mapState(ActorTagStore, {
            actor_tag_list: 'sorted_list',
        })
    },
    mounted() {
        // console.log(`mounted for ${this.actor.actor_name}`)
        this.initTags()
    },
    activated() {
        // console.log(`activated for ${this.actor.actor_name}`)
        this.initTags()
    },
    deactivated() {
        // console.log(`deactivated for ${this.actor.actor_name}`)
        this.editing_tags = []
        this.showing_tags = []
    },
    methods: {
        onSearchTextChange() {
            // console.log("onSearchTextChange", this.search_text)
            // if search_text is empty, show all tags
            if (this.search_text == "") {
                this.showing_tags = this.editing_tags
                return
            }
            // filter editing_tags into showing_tags
            this.showing_tags = []
            for (const group of this.editing_tags) {
                let filtered_group = []
                for (const tag_info of group) {
                    if (tag_info.tag.tag_name.includes(this.search_text)) {
                        filtered_group.push(tag_info)
                    }
                }
                if (filtered_group.length > 0) {
                    this.showing_tags.push(filtered_group)
                }
            }
        },
        initTags() {
            this.editing_tags = []
            for (let i = 0; i < 10; i++) {
                this.editing_tags.push([])
            }
            for (const tag: ActorTagData of this.actor_tag_list) {
                const group_id = Math.floor(tag.tag_priority / 100)
                const hasTag = this.actor.hasTag(tag.tag_id)
                this.editing_tags[group_id].push({tag: tag, selected: hasTag})
            }
            this.editing_tags.reverse()
            this.showing_tags = this.editing_tags
        },
        onSubmit() {
            // merge all selected tags
            let new_tag_list = []
            for (const group of this.editing_tags) {
                for (const tag_info of group) {
                    if (tag_info.selected) {
                        new_tag_list.push(tag_info.tag.tag_id)
                    }
                }
            }

            this.$emit("submit", new_tag_list)
        },
        onCancel() {
            this.$emit("cancel")
        },
    },
}
</script>

<style scoped>

</style>