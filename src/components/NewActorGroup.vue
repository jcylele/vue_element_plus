<template>
  <div style="border: 1px solid ; border-radius: 4px; padding: 3px">
    <div v-if="!show_add">
      <el-button type="default" @click="showAdd(true)">
        Add New Actor Group
      </el-button>
    </div>
    <div v-if="show_add">
      <el-form :model="new_actor_group" label-width="auto">
        <el-form-item label="Name">
          <el-input v-model="new_actor_group.group_name"/>
        </el-form-item>
        <el-form-item label="Desc">
          <el-input v-model="new_actor_group.group_desc"/>
        </el-form-item>
        <el-form-item label="Priority">
          <el-input-number v-model="new_actor_group.group_priority" :min="0" :max="100" :step="10"/>
        </el-form-item>
        <el-form-item label="Has Folder">
          <el-switch v-model="new_actor_group.has_folder"/>
        </el-form-item>
        <el-form-item label="Color">
          <el-color-picker v-model="new_actor_group.group_color"/>
        </el-form-item>
        <el-form-item>
          <el-space direction="horizontal">
            <el-form-item>
              <el-button type="primary" @click="onAddActorGroup">Add</el-button>
            </el-form-item>
            <el-form-item>
              <el-button type="warning" @click="showAdd(false)">Cancel</el-button>
            </el-form-item>
          </el-space>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts">
import {mapActions} from "pinia";
import {ActorGroupStore} from "../store/ActorGroupStore.js";
import ActorGroupData from "../data/ActorGroupData";
import {addActorGroup} from "../ctrls/ActorGroupCtrl";
import {logInfo} from "../ctrls/FetchCtrl";

export default {
  name: "NewActorGroup",
  emits: ['group_added'],
  data() {
    return {
      new_actor_group: new ActorGroupData(),
      show_add: false
    }
  },
  methods: {
    ...mapActions(ActorGroupStore, {
      addActorGroup: 'add',
    }),

    showAdd(val: boolean) {
      this.show_add = val
    },

    async onAddActorGroup() {
      // console.log("Add", this.new_actor_group)
      const [ok, group] = await addActorGroup(this.new_actor_group)
      if (ok) {
        this.new_actor_group = new ActorGroupData()
        this.show_add = false
        this.addActorGroup(group)
        logInfo("add succeed")
        this.$emit("group_added")
      }
    },
  }
}
</script>

<style scoped>

</style>