<template>
  <el-container>
    <el-space direction="vertical" size="large" :fill="true">
      <NewActorTag @tag_added="initTags"/>
      <el-input v-model="search_text"
                @input="onSearchTextChange"
                placeholder="Search tags"
                clearable/>
      <el-space v-for="tag_group in editing_tags"
                style="border: 1px solid ; border-radius: 4px; padding: 2px"
                direction="horizontal" :wrap="true" :size="3" alignment="stretch">

        <el-checkbox-button v-for="tag_info in tag_group"
                            v-model="tag_info.selected"
                            :class="searchClass(tag_info)">
          {{ tag_info.tag.tag_name }}

        </el-checkbox-button>

      </el-space>
      <!-- buttons -->
      <el-space direction="horizontal" alignment="center">
        <el-button type="primary" @click="onSubmit">
          Save
        </el-button>
        <el-button type="warning" @click="onCancel">
          Cancel
        </el-button>
      </el-space>

    </el-space>

  </el-container>
</template>

<script lang="ts">
import ActorTagData from "../data/ActorTagData.js";
import {mapState} from "pinia";
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
    }
  },
  computed: {
    ...mapState(ActorTagStore, {
      actor_tag_list: 'sorted_list',
    })
  },
  mounted() {
    console.log(`mounted ActorTagChooser for [${this.actor.actor_name}]`)
    this.initTags()
  },
  methods: {
    onSearchTextChange() {
      console.log("onSearchTextChange", this.search_text)
    },
    searchClass(tag_info: TagInfo) {
      let filtered = this.search_text != "" && !tag_info.tag.tag_name.includes(this.search_text)
      return filtered ? "filtered-text" : "normal-text"
    },
    initTags() {
      this.editing_tags = []

      let tags_map: Map<number, TagInfo[]> = new Map<number, TagInfo[]>();
      for (const tag: ActorTagData of this.actor_tag_list) {
        const group_id = Math.floor(tag.tag_priority / 10)
        let group = tags_map.get(group_id)
        if (!group) {
          group = []
          tags_map.set(group_id, group)
        }
        const hasTag = this.actor.hasTag(tag.tag_id)
        group.push({tag: tag, selected: hasTag})
      }
      let map_keys = Array.from(tags_map.keys());
      // console.log(map_keys)
      map_keys.sort()
      map_keys.reverse()
      for (const key of map_keys) {
        let tag_list = tags_map.get(key)
        // console.log(`${key} len ${tag_list.length}`)
        this.editing_tags.push(tag_list)
      }
      // console.log(this.editing_tags)
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
      this.editing_tags = []

      this.$emit("submit", new_tag_list)
    },
    onCancel() {
      this.$emit("cancel")
    },
  },
}
</script>

<style scoped>

.normal-text {
  opacity: 1.0;
}

.filtered-text {
  opacity: 0.3;
}

</style>