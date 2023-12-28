<template>
  <el-container>
    <el-main>
      <div>
        <NewActorTag/>
      </div>
      <div>
        <el-table :data="actor_tag_list" height="512"><!--style="width: 100%" -->
          <el-table-column label="Tag" prop="tag_name" sortable>
            <template #default="scope">
              <el-input v-model="scope.row.tag_name" @change="scope.row.changed = true"/>
            </template>
          </el-table-column>
          <el-table-column label="Priority" prop="tag_priority" sortable>
            <template #default="scope">
              <el-input-number v-model="scope.row.tag_priority" :min="0" :max="100"
                               @change="scope.row.changed = true"/>
            </template>
          </el-table-column>
          <el-table-column label="Used Count" prop="used_count" sortable>
            <template #default="scope">
              <el-text>{{ scope.row.used_count }}</el-text>
            </template>
          </el-table-column>
          <el-table-column label="Operations">
            <template #default="scope">
              <el-button v-if="scope.row.changed" type="primary" size="large"
                         @click="onSaveActorTag(scope.$index, scope.row)">
                Save
              </el-button>
              <el-button v-if="scope.row.changed" type="warning" size="large"
                         @click="onResetActorTag(scope.$index, scope.row)">
                Reset
              </el-button>
              <el-button type="danger" size="large" @click="onDeleteActorTag(scope.$index, scope.row)">
                Delete
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-main>
  </el-container>
</template>

<script lang="ts">
import ActorTagData from "../data/ActorTagData";
import {ElMessage} from "element-plus";
import NewActorTag from "./NewActorTag.vue";
import {delActorTag, editActorTag, getActorTag} from "../ctrls/ActorTagCtrl";
import {mapActions, mapState} from "pinia";
import {ActorTagStore} from "../store/ActorTagStore";

export default {
  name: "ActorTags",
  components: {NewActorTag},

  data() {
    return {}
  },
  computed: {
    ...mapState(ActorTagStore, {actor_tag_list: 'sorted_list'}),
  },
  methods: {
    ...mapActions(ActorTagStore, {
      getTagsFromServer: 'getFromServer',
      removeActorTag: 'remove',
      updateActorTag: 'update'
    }),
    async onSaveActorTag(index: number, tag: ActorTagData) {
      console.log("Save", index, tag)
      const [ok, new_tag] = await editActorTag(tag)
      if (ok) {
        this.updateActorTag(new_tag as ActorTagData, index)
        ElMessage({message: "save succeed", type: "success"})
      } else {
        ElMessage({message: new_tag as string, type: "error"})
      }
    },
    async onResetActorTag(index: number, tag: ActorTagData) {
      console.log("Reset", index, tag)
      const [ok, origin_tag] = await getActorTag(tag.tag_id)
      if (ok) {
        this.updateActorTag(origin_tag as ActorTagData, index)
      } else {
        ElMessage(origin_tag as string)
      }
    },
    async onDeleteActorTag(index: number, tag: ActorTagData) {
      console.log("Delete", index, tag)
      const [ok, ret] = await delActorTag(tag.tag_id)
      if (ok) {
        this.removeActorTag(index)
        ElMessage({message: `Delete ${ret.value} succeed`, type: "success"})
      } else {
        ElMessage(ret as string)
      }
    },
  },
  watch: {},
  async mounted() {
    await this.getTagsFromServer()
  }
}
</script>

<style scoped>

</style>