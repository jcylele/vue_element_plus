<template>
  <el-container>
    <el-main>
      <el-space direction="vertical" :fill="true">
        <NewActorTag @tag_added="refreshTags"/>
        <el-text style="font-size: 24px;font-style: oblique">
          Drag Elements Below To Set Tags Priorities
        </el-text>
        <el-space direction="horizontal" v-if="changed">
          <el-button type="primary" size="default"
                     @click="onSubmitPriority">
            Save
          </el-button>
          <el-button type="warning" size="default"
                     @click="onCancel">
            Reset
          </el-button>
        </el-space>
        <el-space direction="vertical">
          <el-space direction="horizontal"
                    v-for="tag_group in editing_tags"
                    style="border: 1px solid ; border-radius: 4px; padding: 2px"
                    :wrap="true"
                    alignment="stretch">
            <draggable
                :list="tag_group"
                :group="{ name: 'tags', pull: true, put: true }"
                @change="onTagItemMoved"
                class="card_row">
              <ActorTagEditor v-for="tag_info in tag_group"
                              :tag_edit_info="tag_info"
                              :key="tag_info.tag.tag_id"
                              @delete="onDeleteActorTag"
                              class="card"/>
            </draggable>
          </el-space>

        </el-space>
      </el-space>
    </el-main>
  </el-container>
</template>

<script lang="ts">
import ActorTagData from "../data/ActorTagData";
import NewActorTag from "./NewActorTag.vue";
import ActorTagEditor from "./ActorTagEditor.vue"
import {mapActions, mapState} from "pinia";
import {ActorTagStore} from "../store/ActorTagStore";
import {TagEditInfo} from "../data/WebData";
import {VueDraggableNext} from "vue-draggable-next";
import AllActorTagPriorities from "../data/ActorTagPriority";
import {updatePriorities} from "../ctrls/ActorTagCtrl";
import {logInfo} from "../ctrls/FetchCtrl";


export default {
  name: "ActorTags",
  components: {NewActorTag, ActorTagEditor, draggable: VueDraggableNext},

  data() {
    return {
      editing_tags: [] as TagEditInfo[][],
      changed: false
    }
  },
  computed: {
    ...mapState(ActorTagStore, {actor_tag_list: 'sorted_list'}),
  },
  methods: {
    ...mapActions(ActorTagStore, {
      getTagsFromServer: 'getFromServer',
    }),
    onTagItemMoved(evt){
      this.changed = true
    },
    onDeleteActorTag(tag_id: number) {
      for (const group of this.editing_tags) {
        for (let i = 0; i < group.length; i++) {
          if (group[i].tag.tag_id == tag_id) {
            group.splice(i, 1)
            return
          }
        }
      }
    },
    async onSubmitPriority() {
      let changed_priorities = new AllActorTagPriorities()
      for (let i = 0; i < 10; i++) {
        const group = this.editing_tags[i]
        for (let j = 0; j < group.length; j++) {
          const tag = group[j].tag
          const new_tag_priority = (10 - i) * 100 - j - 1
          if (tag.tag_priority != new_tag_priority) {
            changed_priorities.push(tag.tag_id, new_tag_priority)
          }
        }
      }
      if (changed_priorities.length() == 0) return

      let [ok, ret] = await updatePriorities(changed_priorities)
      if (ok) {
        logInfo("priorities of tags saved")
        this.changed = false
      }
    },
    async onCancel() {
      await this.refreshTags()
      this.changed = false
    },
    initTags() {
      this.editing_tags = []
      for (let i = 0; i < 10; i++) {
        this.editing_tags.push([])
      }
      for (const tag: ActorTagData of this.actor_tag_list) {
        const group_id = Math.floor(tag.tag_priority / 100)
        this.editing_tags[group_id].push({tag: tag, is_editing: false})
      }
      this.editing_tags.reverse()
    },
    async refreshTags() {
      await this.getTagsFromServer()
      this.initTags()
    }
  },
  async mounted() {
    await this.refreshTags()
  }
}
</script>

<style scoped>
.card {
  display: table-cell;
  margin: 2px;
}

.card_row {
  min-height: 25px;
  min-width: 100px;
  display: flex;
  flex-wrap: wrap;
}
</style>