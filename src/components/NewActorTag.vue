<template>
  <div style="border: 1px solid ; border-radius: 4px; padding: 3px">
    <div v-if="!show_add">
      <el-button type="default" @click="showAdd(true)" class="new-tag-button">
        Add New Actor Tag
      </el-button>
    </div>
    <div v-if="show_add">
      <el-form :inline="true" :model="new_actor_tag" class="new-tag-form">
        <el-form-item label="Name">
          <el-input v-model="new_actor_tag.tag_name"/>
        </el-form-item>
        <el-form-item label="Priority">
          <el-input-number v-model="new_actor_tag.tag_priority" :min="0" :max="999" :step="100"/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onAddActorTag">Add</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="warning" @click="showAdd(false)">Cancel</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script lang="ts">
import ActorTagData from "../data/ActorTagData";
import {addActorTag} from "../ctrls/ActorTagCtrl";
import {mapActions} from "pinia";
import {ActorTagStore} from "../store/ActorTagStore";
import {logInfo} from "../ctrls/FetchCtrl";

export default {
  name: "NewActorTag",
  emits: ['tag_added'],
  data() {
    return {
      new_actor_tag: new ActorTagData(),
      show_add: false
    }
  },
  methods: {
    ...mapActions(ActorTagStore, {
      addActorTag: 'add',
    }),

    showAdd(val: boolean) {
      this.show_add = val
    },
    async onAddActorTag() {
      console.log("Add", this.new_actor_tag)
      const [ok, tag] = await addActorTag(this.new_actor_tag)
      if (ok) {
        this.new_actor_tag = new ActorTagData()
        this.show_add = false
        this.addActorTag(tag)
        logInfo(`tag added: ${tag.tag_name}`)
        this.$emit("tag_added")
      }
    },
  }
}
</script>

<style scoped>
.new-tag-form .el-form-item{
  margin: 5px 8px;
}
.new-tag-button {
  margin: 5px 8px;
}
</style>