<template>
  <el-container>
    <el-header>
      List of Actors
    </el-header>
    <el-main>
      <div>
        <NewActorTag @actorTagAdded="getActorTagList"/>
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
              <el-input-number size="large" v-model="scope.row.tag_priority" :min="0" :max="100"
                               @change="scope.row.changed = true"/>
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
import {delActorTag, editActorTag, getActorTag, getActorTagList} from "../ctrls/ActorTagCtrl";

export default {
  name: "ActorTags",
  components: {NewActorTag},

  data() {
    return {
      actor_tag_list: [] as ActorTagData[],
      new_actor_tag: new ActorTagData(),
      show_add: false
    }
  },
  computed: {},
  methods: {
    showAdd(val: boolean) {
      this.show_add = val
    },
    async getActorTagList() {
      const [ok, tag_list] = await getActorTagList()
      if (ok) {
        this.actor_tag_list = tag_list as ActorTagData[]
      } else {
        ElMessage(tag_list as string)
      }
    },
    async onSaveActorTag(index: number, tag: ActorTagData) {
      console.log("Save", index, tag)
      const [ok, new_tag] = await editActorTag(tag)
      if (ok) {
        this.actor_tag_list[index] = new_tag as ActorTagData
        ElMessage({message: "save succeed", type: "success"})
      } else {
        ElMessage({message: new_tag as string, type: "error"})
      }
    },
    async onResetActorTag(index: number, tag: ActorTagData) {
      console.log("Reset", index, tag)
      const [ok, origin_tag] = await getActorTag(tag.tag_id)
      if (ok) {
        this.actor_tag_list[index] = origin_tag as ActorTagData
      } else {
        ElMessage(origin_tag as string)
      }
    },
    async onDeleteActorTag(index: number, tag: ActorTagData) {
      console.log("Delete", index, tag)
      const [ok, ret] = await delActorTag(tag.tag_id)
      if (ok) {
        this.actor_tag_list.splice(index, 1)
        ElMessage({message: `Delete ${ret.value} succeed`, type: "success"})
      } else {
        ElMessage(ret as string)
      }
    },
  },
  watch: {},
  async mounted() {
    await this.getActorTagList()
  }
}
</script>

<style scoped>

</style>