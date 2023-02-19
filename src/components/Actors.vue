<template>
  <el-container>
    <el-header>
      List of Actors
    </el-header>
    <el-main>
      <div margin="20">
        <el-radio-group v-model="actor_category" size="large">
          <el-radio-button v-for="category in ActorCategoryList" v-bind:label="category.value">
            {{ category.name }}
          </el-radio-button>
        </el-radio-group>
      </div>
      <div>
        <el-table :data="actor_list" height="512"><!--style="width: 100%" -->
          <!-- actor_name -->
          <el-table-column label="Name">
            <template #default="scope">
              <el-row :gutter="20" align="bottom">
                <el-avatar shape="square" size="large" fit="contain" :src="iconActor(scope.row.actor_name)"/>
                <el-link :href="hrefActor(scope.row.actor_name)" font_size="20px" :underline="false" target="_blank" type="success" size="large">
                  {{ scope.row.actor_name }}
                </el-link>
                <el-icon v-if="scope.row.completed">

                </el-icon>
              </el-row>
            </template>
          </el-table-column>
          <!-- actor tags -->
          <el-table-column label="Tag">
            <template #default="scope">
              <el-row :gutter="20">
                <el-tag v-for="tag_id in scope.row.rel_tags" size="large" @close="removeActorFromTag(scope.$index, scope.row, tag_id)" closable round>
                  {{ getTagName(tag_id) }}
                </el-tag>
                <el-select v-model="scope.row._new_tag" @change="addTagToActor(scope.$index, scope.row)" filterable clearable fit-input-width placeholder="+ New Tag">
                  <el-option
                      v-for="actor_tag in actor_tag_list"
                      :key="actor_tag.tag_id"
                      :label="actor_tag.tag_name"
                      :value="actor_tag.tag_id"
                  />
                </el-select>
              </el-row>
            </template>
          </el-table-column>
          <!-- Category -->
          <el-table-column label="Category">
            <template #default="scope">
              <el-select v-model="scope.row.actor_category" placeholder="Select">
                <el-option
                    v-for="category in ActorCategoryList"
                    :key="category.name"
                    :label="category.name"
                    :value="category"
                    :disabled="!category.selectable"
                />
              </el-select>
            </template>
          </el-table-column>
          <!-- end of columns -->
        </el-table>
        <el-pagination
            v-model:current-page="cur_actor_page"
            :page-size="actor_size"
            :total="actor_count"
            @current-change="onActorPageChange"
            layout="total, prev, pager, next"
            background
        />
      </div>
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

export default {
  data() {
    return {
      actor_category: ActorCategory.All.value,
      actor_tag_list: [] as ActorTagData[],
      actor_list: [] as ActorData[],
      actor_size: 10,
      cur_actor_page: 1,
      actor_count: 0
    }
  },
  computed: {
    ActorCategoryList(): ActorCategory[] {
      return Object.values(ActorCategory)
    },
  },
  methods: {
    loadMoreActors() {
      console.log("loadMoreActors")
      // this.actor_list.push("a","b","c","d")
    },
    hrefActor(actor_name) {
      return `https://coomer.party/onlyfans/user/${actor_name}`
    },
    iconActor(actor_name) {
      return `https://coomer.party/icons/onlyfans/${actor_name}`
    },
    async onActorPageChange() {
      console.log(this.cur_actor_page)
      const [ok, actor_list] = await ActorCtrl.getActorList(this.actor_category, this.actor_size, (this.cur_actor_page - 1) * this.actor_size)
      if (ok) {
        this.actor_list = actor_list
      } else {
        this.actor_list = []
        ElMessage(actor_list as string)
      }
    },
    async onActorCategoryChange() {
      this.actor_list = []

      this.actor_count = 0
      const [ok, actor_count] = await ActorCtrl.getActorCount(this.actor_category)
      if (ok) {
        this.actor_count = actor_count
      } else {
        ElMessage(actor_count as string)
      }

      this.cur_actor_page = 1
      await this.onActorPageChange()
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
        this.actor_list[actor_index] = new_actor as ActorTagData
        ElMessage({message:"remove tag succeed", type:"success"})
      } else {
        ElMessage(new_actor as string)
      }
    },
    async addTagToActor(actor_index: number, actor: ActorData) {
      const [ok, new_actor] = await ActorCtrl.addTagToActor(actor.actor_name, actor._new_tag)
      if (ok) {
        this.actor_list[actor_index] = new_actor as ActorTagData
        ElMessage({message:"add tag succeed", type:"success"})
      } else {
        ElMessage(new_actor as string)
      }
    },
  },
  watch: {
    async actor_category(new_actor_category, old_actor_category) {
      console.log(`${old_actor_category} -> ${new_actor_category}`)
      await this.onActorCategoryChange()
    }
  },
  async mounted() {
    await this.getActorTagList()
    await this.onActorCategoryChange()
  }
}

</script>

<style scoped>

</style>