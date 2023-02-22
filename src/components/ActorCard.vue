<template>
  <el-card class="box-card"
           :key="actor.actor_name"
           :body-style="{ padding: '10px' }"
           shadow="always"
           style="width: 200px;">
    <el-space direction="vertical" alignment="center" :fill="true">

      <!-- actor avatar -->
      <el-image :src="iconActor(actor.actor_name)" style="height: 180px"/>

      <!-- actor name -->
      <el-popover trigger="click" placement="top"
                  popper-style="box-shadow: rgb(14 18 22 / 35%) 0px 10px 38px -10px, rgb(14 18 22 / 20%) 0px 10px 20px -15px; padding: 20px;"
      >
        <template #reference>
          <div :class="styleActor(actor.actor_category)"
               style="font-size: 20px; word-wrap: anywhere; text-align: center;">
            {{ actor.actor_name }}
          </div>
        </template>
        <template #default>
          <el-space direction="vertical" :fill="true">
            <el-button @click="gotoActorPage(actor.actor_name)" :class="styleActor(actor.actor_category)">
              Go To Page
            </el-button>
            <el-button v-if="actor.hasFolder()" @click="openFolder(actor.actor_name)"
                       :class="styleActor(actor.actor_category)">
              Open Folder
            </el-button>
          </el-space>
        </template>
      </el-popover>

      <!--actor complete mark + category -->
      <el-space direction="horizontal" alignment="center">
        <svg-icon v-if="actor.completed" size="20px" name="completed"
                  style="color: lightgreen;"/>
        <el-select v-model="actor.actor_category"
                   @change="setActorCategory"
        >
          <el-option
              style="width: fit-content"
              v-for="category in all_actor_category_list"
              :key="category.name"
              :label="category.name"
              :value="category"
              :fit-input-width="true"
              :disabled="!category.selectable"
              :class="styleActor(category)">
            {{ `[${category.name}] (${category.desc})` }}
          </el-option>
        </el-select>
        <svg-icon @click="actor._edit_tags = true"
                  size="20px" name="edit"/>
      </el-space>

      <!--actor tags -->
      <el-space wrap>
        <el-tag v-for="tag_id in actor.rel_tags"
                @close="removeActorFromTag(tag_id)"
                :closable="actor._edit_tags"
                style="font-size: 18px;background: lightblue;color: hotpink"
                round>
          {{ getTagName(tag_id) }}
        </el-tag>
        <el-select v-if="actor._edit_tags"
                   v-model="actor._new_tag_list"
                   placeholder="+ New Tag"
                   multiple filterable clearable>
          <el-option
              v-for="actor_tag in actor_tag_list"
              :key="actor_tag.tag_id"
              :label="actor_tag.tag_name"
              :value="actor_tag.tag_id"
          />
        </el-select>
      </el-space>
      <el-space v-if="actor._edit_tags" direction="horizontal" alignment="center">
        <el-button type="primary" @click="onAddTag">
          Save
        </el-button>
        <el-button type="warning" @click="onCancelAddTag(actor_index, actor)">
          Cancel
        </el-button>
      </el-space>
    </el-space>
  </el-card>
</template>

<script lang="ts">
import ActorData from "../data/ActorData";
import ActorCategory from "../consts/ActorCategory";
import ActorCtrl from "../ctrls/ActorCtrl";
import {ElMessage} from "element-plus";
import ActorTagData from "../data/ActorTagData";
import {IArrayElement} from "../data/ArrayElement";
export default {
  name: "ActorCard",
  // props from parent
  props: {
    actor_data: {data: ActorData, index: Number},
    actor_tag_list: Array[ActorTagData],
  },
  computed: {
    actor(){
      return this.actor_data.data
    },
    actor_index(){
      return this.actor_data.index
    }
  },
  // declare emitted events to parent
  emits: ['change'],
  data() {
    return {
      all_actor_category_list: ActorCategory.AllCategories,
    }
  },
  methods: {
    iconActor(actor_name: string) {
      return `https://coomer.party/icons/onlyfans/${actor_name}`
    },
    styleActor(category: ActorCategory) {
      return `actor_${category.name}`
    },
    gotoActorPage(actor_name: string) {
      const url = `https://coomer.party/onlyfans/user/${actor_name}`
      window.open(url, '_blank', 'noreferrer');
    },
    openFolder(actor_name: string) {
      ActorCtrl.openActorFolder(actor_name)
    },
    getTagName(tag_id: number): string {
      for (const tag of this.actor_tag_list) {
        if (tag.tag_id === tag_id) {
          return tag.tag_name
        }
      }
      return `Error(${tag_id})`
    },
    async setActorCategory() {
      const [ok, new_actor] = await ActorCtrl.changeActorCategory(this.actor.actor_name, this.actor.actor_category.value)
      if (ok) {
        this.actor_data.data = new_actor
        this.$emit('change', this.actor_data)
        ElMessage({message: "change category succeed", type: "success"})
      } else {
        ElMessage(new_actor as string)
      }
    },
    async removeActorFromTag(tag_id: number) {
      const [ok, new_actor] = await ActorCtrl.removeTagFromActor(this.actor.actor_name, tag_id)
      if (ok) {
        this.actor_data.data = new_actor
        this.$emit('change', this.actor_data)
        ElMessage({message: "remove tag succeed", type: "success"})
      } else {
        ElMessage(new_actor as string)
      }
    },
    async onAddTag() {
      const [ok, new_actor] = await ActorCtrl.addTagToActor(this.actor.actor_name, this.actor._new_tag_list)
      if (ok) {
        this.actor_data.data = new_actor
        this.$emit('change', this.actor_data)
        ElMessage({message: "add tags succeed", type: "success"})
      } else {
        ElMessage(new_actor as string)
      }
    },
    async onCancelAddTag() {
      this.actor._new_tag_list = []
      this.actor._edit_tags = false
    },
  },
}
</script>

<style scoped>

.actor_all {
  color: sandybrown;
}

.actor_init {
  color: darkgreen;
}

.actor_liked {
  color: hotpink;
}

.actor_dislike {
  color: blue;
}

.actor_enough {
  color: orangered;
}
</style>