<template>
  <el-container>
    <el-header>
      <el-radio-group v-model="actor_category" size="large" style="margin: 20px">
        <el-radio-button v-for="category in ActorCategoryList" :label="category.value">
          {{ category.name }}
        </el-radio-button>
      </el-radio-group>
    </el-header>

    <el-main>
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
            <el-link :href="hrefActor(actor.actor_name)" target="_blank"
                     :class="styleActor(actor.actor_category)"
                     style="font-size: 20px; word-wrap: anywhere;">
              {{ actor.actor_name }}
            </el-link>
            <!-- complete + category -->
            <el-space direction="horizontal" alignment="center">
              <svg-icon v-if="actor.completed" size="20px" name="completed"
                        style="color: limegreen;"/>
              <el-select v-model="actor.actor_category"
                         @change="setActorCategory(actor_index, actor)"
              >
                <el-option
                    style="width: fit-content"
                    v-for="category in ActorCategoryList"
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
                        size="20px" name="edit" />
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
              <el-button type="primary"  @click="onAddTag(actor_index, actor)">
                Save
              </el-button>
              <el-button type="warning"  @click="onCancelAddTag(actor_index, actor)">
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
    styleActor(category: ActorCategory) {
      return `actor_${category.name}`
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
        ElMessage({message: "remove tag succeed", type: "success"})
      } else {
        ElMessage(new_actor as string)
      }
    },
    async onAddTag(actor_index: number, actor: ActorData) {
      const [ok, new_actor] = await ActorCtrl.addTagToActor(actor.actor_name, actor._new_tag_list)
      if (ok) {
        this.actor_list[actor_index] = new_actor as ActorTagData
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
      //complicated
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

.actor_name_column {
  display: inline-flex;
  margin: 5px;
  padding: 5px;
  align-content: baseline;
}

.wrapper {
  display: grid;
  grid-template-columns: repeat(1fr, 1fr, 1fr, 1fr);
  grid-auto-rows: minmax(100px, auto);
}

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