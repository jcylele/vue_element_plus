<template>
  <el-space direction="vertical" :fill="true" style="width: 100%">
    <NewActorGroup @group_added="onNewGroupAdded"/>
    <el-table :data="actor_group_list" row-key="uuid">
      <el-table-column label="Name" min-width="100px">
        <template #default="scope">
          <el-input v-model="scope.row.group_name" @change="scope.row.changed = true"/>
        </template>
      </el-table-column>
      <el-table-column label="Desc" min-width="300px">
        <template #default="scope">
          <el-input v-model="scope.row.group_desc" @change="scope.row.changed = true"/>
        </template>
      </el-table-column>
      <el-table-column label="Priority" min-width="200px">
        <template #default="scope">
          <el-input-number v-model="scope.row.group_priority"
                           :min="0" :max="100"
                           @change="scope.row.changed = true"/>
        </template>
      </el-table-column>
      <el-table-column label="Has Folder" min-width="100px">
        <template #default="scope">
          <el-switch v-model="scope.row.has_folder"
                     @change="scope.row.changed = true"/>
        </template>
      </el-table-column>
      <el-table-column label="Color" min-width="100px">
        <template #default="scope">
          <el-color-picker v-model="scope.row.group_color"
                           @change="scope.row.changed = true"/>
        </template>
      </el-table-column>
      <el-table-column label="Operations" min-width="400px">
        <template #default="scope">
          <el-button v-if="scope.row.changed"
                     type="primary" size="default"
                     @click="onSaveActorGroup(scope.row)">
            Save
          </el-button>
          <el-button v-if="scope.row.changed"
                     type="warning" size="default"
                     @click="onResetActorGroup(scope.row)">
            Reset
          </el-button>
          <el-button type="danger" size="default"
                     @click="onDeleteActorGroup(scope.row)">
            Delete
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-space>
</template>

<script lang="ts">
import {mapActions, mapState} from "pinia";
import {ActorGroupStore} from "../store/ActorGroupStore";
import ActorGroupData from "../data/ActorGroupData";
import NewActorGroup from "./NewActorGroup.vue";
import {delActorGroup, getActorGroup, updateActorGroup} from "../ctrls/ActorGroupCtrl";
import {logInfo, logWarn} from "../ctrls/FetchCtrl";

export default {
  name: "ActorGroups",
  components: {NewActorGroup},
  data() {
    return {
      new_actor_group: new ActorGroupData(),
    }
  },
  computed: {
    ...mapState(ActorGroupStore, {actor_group_list: 'sorted_list'}),
  },
  methods: {
    ...mapActions(ActorGroupStore, {
      getGroupsFromServer: 'getFromServer',
      updateGroup: 'update',
      removeGroup: 'remove',
    }),
    onNewGroupAdded() {

    },
    async onSaveActorGroup(actorGroup: ActorGroupData) {
      const [ok, actor_group] = await updateActorGroup(actorGroup)
      if (ok) {
        this.updateGroup(actor_group)
        logInfo("save succeed")
      }
    },

    async onResetActorGroup(actorGroup: ActorGroupData) {
      const [ok, actor_group] = await getActorGroup(actorGroup.group_id)
      if (ok) {
        this.updateGroup(actor_group)
        logInfo("reset succeed")
      }
    },

    async onDeleteActorGroup(actorGroup: ActorGroupData) {
      const [ok, succeed] = await delActorGroup(actorGroup.group_id)
      if (ok) {
        if (succeed) {
          this.removeGroup(actorGroup.group_id)
          logInfo("delete group succeed")
        } else {
          logWarn("delete group failed, maybe has actors in it")
        }
      }
    },
  },
  async mounted() {
    await this.getGroupsFromServer()
  },
}
</script>

<style scoped>

</style>