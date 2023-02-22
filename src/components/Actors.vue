<template>
  <el-container>
    <el-main>
      <el-form :model="filter_condition"
               label-width="100px" label-position="left">

        <el-form-item label="Category">

          <el-checkbox-group v-model="filter_condition.category_list"
                             @change="onCheckedCategoryChange"
                             size="large">
            <el-checkbox-button v-for="category in all_actor_category_list" :key="category.value"
                                :label="category.value">
              {{ category.name }}
            </el-checkbox-button>
          </el-checkbox-group>
          <el-checkbox
              size="large" border
              style="margin-left: 10px"
              v-model="is_category_all"
              :indeterminate="is_category_partial"
              @change="checkAllCategory">
            All
          </el-checkbox>
        </el-form-item>
        <el-form-item label="Tags">
          <el-select v-model="filter_condition.tag_list"
                     multiple filterable clearable>
            <el-option
                v-for="actor_tag in actor_tag_list"
                :key="actor_tag.tag_id"
                :label="actor_tag.tag_name"
                :value="actor_tag.tag_id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="Name" style="width: 320px">
          <el-input v-model="filter_condition.name" clearable/>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="onFilterConditionChange">Search</el-button>
          <el-button>Cancel</el-button>
        </el-form-item>
      </el-form>
      <el-divider/>
      <el-pagination
          v-model:current-page="cur_actor_page"
          :page-size="actor_size"
          :total="actor_count"
          @current-change="onActorPageChange"
          layout="total, prev, pager, next"
          background
          style="margin-bottom: 20px"
      />
      <el-space wrap size="large" alignment="stretch">
        <el-card v-for="(actor, actor_index) in actor_list"
                 :key="actor.actor_name"
                 class="box-card"
                 :body-style="{ padding: '10px' }"
                 shadow="always"
                 style="width: 200px;">
          <el-space direction="vertical" alignment="center" :fill="true">
            <!-- avatar -->
            <el-image :src="iconActor(actor.actor_name)" style="height: 180px"/>
            <!-- name -->
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


            <!-- complete + category -->
            <el-space direction="horizontal" alignment="center">
              <svg-icon v-if="actor.completed" size="20px" name="completed"
                        style="color: limegreen;"/>
              <el-select v-model="actor.actor_category"
                         @change="setActorCategory(actor_index, actor)"
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
            <!-- tags -->
            <el-space wrap>
              <el-tag v-for="tag_id in actor.rel_tags"
                      @close="removeActorFromTag(actor_index, actor, tag_id)"
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
              <el-button type="primary" @click="onAddTag(actor_index, actor)">
                Save
              </el-button>
              <el-button type="warning" @click="onCancelAddTag(actor_index, actor)">
                Cancel
              </el-button>
            </el-space>
          </el-space>
        </el-card>
      </el-space>
    </el-main>
  </el-container>
</template>

<script lang="ts">
import ActorCategory from '../consts/ActorCategory'
import ActorData from "../data/ActorData";
import ActorCtrl from "../ctrls/ActorCtrl";
import {ElMessage} from "element-plus";
import ActorTagData from "../data/ActorTagData";
import ActorTagCtrl from "../ctrls/ActorTagCtrl";
import ActorFilterCondition from "../data/ActorFilterCondition";

export default {
  data() {
    return {
      filter_condition: {
        name: "",
        category_list: [],
        tag_list: []
      } as ActorFilterCondition,
      all_actor_category_list: [] as ActorCategory[],
      is_category_partial: false,
      is_category_all: false,
      actor_tag_list: [] as ActorTagData[],
      actor_list: [] as ActorData[],
      actor_size: 10,
      cur_actor_page: 1,
      actor_count: 0
    }
  },
  computed: {},
  methods: {
    gotoActorPage(actor_name: string) {
      const url = `https://coomer.party/onlyfans/user/${actor_name}`
      window.open(url, '_blank', 'noreferrer');
    },
    openFolder(actor_name: string) {
      ActorCtrl.openActorFolder(actor_name)
    },
    iconActor(actor_name: string) {
      return `https://coomer.party/icons/onlyfans/${actor_name}`
    },
    styleActor(category: ActorCategory) {
      return `actor_${category.name}`
    },
    async onActorPageChange() {
      console.log(this.cur_actor_page)
      const [ok, actor_list] = await ActorCtrl.getActorList(this.filter_condition, this.actor_size, (this.cur_actor_page - 1) * this.actor_size)
      if (ok) {
        this.actor_list = actor_list
      } else {
        this.actor_list = []
        ElMessage(actor_list as string)
      }
    },
    async onFilterConditionChange() {
      this.actor_list = []

      this.actor_count = 0
      const [ok, actor_count] = await ActorCtrl.getActorCount(this.filter_condition)
      if (ok) {
        this.actor_count = actor_count
      } else {
        ElMessage(actor_count as string)
      }

      this.cur_actor_page = 1
      await this.onActorPageChange()
    },

    checkAllCategory(val : boolean){
      // console.log("all", val)
      if (val){
        this.filter_condition.category_list = this.all_actor_category_list.map((category,_,__) => category.value)
      }else {
        this.filter_condition.category_list = []
      }
      this.is_category_partial = false
    },

    onCheckedCategoryChange(val: number[]){
      // console.log("check", ...val)
      const length = this.filter_condition.category_list.length
      this.is_category_all = length === this.all_actor_category_list.length
      this.is_category_partial = length > 0 && length < this.all_actor_category_list.length
    },

    async getActorTagList() {
      const [ok, tag_list] = await ActorTagCtrl.getActorTagList()
      if (ok) {
        this.actor_tag_list = tag_list as ActorTagData[]
      } else {
        ElMessage(tag_list as string)
      }
    },
    getTagName(tag_id: number): string {
      for (const tag of this.actor_tag_list) {
        if (tag.tag_id === tag_id) {
          return tag.tag_name
        }
      }
      return `Error(${tag_id})`
    },
    async removeActorFromTag(actor_index: number, actor: ActorData, tag_id: number) {
      const [ok, new_actor] = await ActorCtrl.removeTagFromActor(actor.actor_name, tag_id)
      if (ok) {
        this.actor_list[actor_index] = new_actor as ActorData
        ElMessage({message: "remove tag succeed", type: "success"})
      } else {
        ElMessage(new_actor as string)
      }
    },
    async onAddTag(actor_index: number, actor: ActorData) {
      const [ok, new_actor] = await ActorCtrl.addTagToActor(actor.actor_name, actor._new_tag_list)
      if (ok) {
        this.actor_list[actor_index] = new_actor as ActorData
        ElMessage({message: "add tags succeed", type: "success"})
      } else {
        ElMessage(new_actor as string)
      }
    },

    async onCancelAddTag(actor_index: number, actor: ActorData) {
      actor._new_tag_list = []
      actor._edit_tags = false
    },

    async setActorCategory(actor_index: number, actor: ActorData) {
      const [ok, new_actor] = await ActorCtrl.changeActorCategory(actor.actor_name, actor.actor_category.value)
      if (ok) {
        if (this.actor_category === new_actor.actor_category) {
          this.actor_list[actor_index] = new_actor as ActorData
        } else {
          this.actor_list.splice(actor_index, 1)
        }
        ElMessage({message: "change category succeed", type: "success"})
      } else {
        ElMessage(new_actor as string)
      }
    },
  },
  watch: {},
  async mounted() {
    this.all_actor_category_list = Object.values(ActorCategory)
    await this.getActorTagList()
    // await this.onFilterConditionChange()
  }
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