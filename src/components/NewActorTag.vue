<template>
  <div style="border: 1px solid ; border-radius: 4px; padding: 3px">
    <div v-if="!show_add">
      <el-button type="default" @click="showAdd(true)">
        Add New Actor Tag
      </el-button>
    </div>
    <div v-if="show_add">
      <el-form :inline="true" :model="new_actor_tag" class="demo-form-inline">
        <el-form-item label="Name">
          <el-input v-model="new_actor_tag.tag_name"/>
        </el-form-item>
        <el-form-item label="Priority">
          <el-input-number v-model="new_actor_tag.tag_priority" :min="0" :max="100"/>
        </el-form-item>
        <el-form-item label="Color">
          <el-color-picker v-model="new_actor_tag.tag_color" size="large"/>
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
import {ElMessage} from "element-plus";
import {addActorTag} from "../ctrls/ActorTagCtrl";
import {mapActions} from "pinia";
import {ActorTagStore} from "../store/ActorTagStore";

export default {
  name: "NewActorTag",
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
        ElMessage({message: "add succeed", type: "success"})
      } else {
        ElMessage({message: tag, type: "error"})
      }
    },
  }
}
</script>

<style scoped>

</style>