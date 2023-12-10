<template>
  <el-card class="box-card"
           :key="actor.actor_name"
           :body-style="{ padding: '10px' }"
           shadow="always"
           style="width: 200px;">
    <el-space direction="vertical" alignment="center" :fill="true">

      <!-- actor avatar -->
      <div style="position: relative;">
        <el-image :src="iconActor(actor.actor_name)" style="height: 180px"/>
        <svg-icon v-if="!actor.star" size="40px" name="star_empty"
                  @click="changeStar(true)"
                  style="color: whitesmoke;position: absolute; top: 0; right: 0;"/>
        <svg-icon v-if="actor.star" size="40px" name="star_filled"
                  @click="changeStar(false)"
                  style="color: gold;position: absolute; top: 0; right: 0;"/>
      </div>


      <!-- actor name -->
      <el-popover trigger="click" placement="top">
        <template #reference>
          <div :class="styleActor(actor.actor_category)"
               style="font-size: 20px; word-wrap: anywhere; text-align: center;">
            {{ actor.actor_name }}
          </div>
        </template>
        <template #default>
          <el-space direction="vertical" :fill="true">
            <el-space direction="horizontal" alignment="center">
              <el-button @click="gotoActorPage(actor.href)" :class="styleActor(actor.actor_category)">
                Go To Page
              </el-button>
              <el-button v-if="actor.hasFolder()" @click="openFolder(actor.actor_name)"
                         :class="styleActor(actor.actor_category)">
                Open Folder
              </el-button>
            </el-space>
            <el-space direction="horizontal" v-if="actor.hasFolder()"  alignment="center">
              <el-link v-for="page in download_pages"
                       @click="startDownload(actor.actor_name, page)"
                       :class="styleActor(actor.actor_category)">
                {{ formatPageCount(page) }}
              </el-link>
            </el-space>
          </el-space>
        </template>
      </el-popover>

      <!-- actor remark -->
      <el-popover trigger="click" placement="top" width="180">
        <template #reference>
          <el-text style="font-size: 16px; color: black;" tag="ins">
            {{ actor.remark ? actor.remark : "No Remark" }}
          </el-text>
        </template>
        <template #default>
          <el-space direction="vertical" :fill="true">
            <el-input v-model="actor.remark" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }"/>
            <el-button type="primary" size="large"
                       @click="setActorRemark()">
              Save
            </el-button>
            <el-button type="warning" size="large"
                       @click="resetActor()">
              Reset
            </el-button>
          </el-space>
        </template>
      </el-popover>

      <!--      <el-space direction="horizontal" alignment="center" wrap>-->
      <el-text style="font-size: 16px; color: black;" tag="ins">
        {{ `[${actor.post_info[0]} / ${actor.post_info[1]}]` }}
      </el-text>
      <!--      <el-text v-if="actor.hasFolder()" style="font-size: 14px; color: darkorange;" tag="ins">-->
      <!--                {{ `${actor.fileSize()}GB(${actor.fileList()})` }}-->
      <!--      </el-text>-->
      <el-text v-for="res_str in actor.resSizeList()"
               style="font-size: 12px; color: hotpink;">
        {{ res_str }}
      </el-text>
      <!--      </el-space>-->

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
        <svg-icon @click="onStartEditTag()"
                  size="20px" name="edit"/>
      </el-space>

      <!--actor tags -->
      <el-space wrap v-if="!actor._edit_tags">
        <el-tag v-for="tag_id in actor.rel_tags"
                :class="getColorStyleName(tag_id)"
                :style="{'font-size': '18px'}"
                round>
          {{ getTagName(tag_id) }}
        </el-tag>
      </el-space>
      <el-space wrap v-if="actor._edit_tags">
        <el-select v-model="actor._new_tag_list"
                   placeholder="+ New Tag"
                   :reserve-keyword="false"
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
        <el-button type="primary" @click="onSubmitTag">
          Save
        </el-button>
        <el-button type="warning" @click="onCancelAddTag">
          Cancel
        </el-button>
      </el-space>
    </el-space>
  </el-card>
</template>

<script lang="ts">
import ActorCategory from "../consts/ActorCategory";
import {ElMessage} from "element-plus";
import ActorData from "../data/ActorData";
import {
  ChangeActorTag,
  changeActorCategory,
  changeActorStar,
  openActorFolder, changeActorRemark, getActor
} from "../ctrls/ActorCtrl";
import {mapActions, mapState} from "pinia";
import {ActorTagStore} from "../store/ActorTagStore";
import {downloadAllPosts, downloadByNames} from "../ctrls/DownloadCtrl";
import {DownloadLimitForm} from "../data/SimpleForms";

export default {
  name: "ActorCard",
  // props from parent
  props: {
    actor_data: {data: ActorData, index: Number},
  },
  computed: {
    ...mapState(ActorTagStore, {
      actor_tag_list: 'sorted_list'
    }),
    actor() {
      return this.actor_data.data
    },
    all_actor_category_list() {
      return ActorCategory.AllCategories
    }
  },
  // declare emitted events to parent
  emits: ['change'],
  data() {
    return {
      download_pages: [-1, 1, 2, 5, 10, 20, 0]
    }
  },
  mounted() {
    this.actor.sortTags(this.compareActorTagId)
  },
  methods: {
    ...mapActions(ActorTagStore, {
      getTagName: 'getName',
      getColorStyleName: 'getColorStyleName',
      compareActorTagId: 'compareActorTagId',
    }),

    onRecvUpdateMsg(ok: boolean, new_actor: ActorData, msg: string) {
      if (ok) {
        this.actor_data.data = new_actor
        this.$emit('change', this.actor_data)
        ElMessage({message: msg, type: "success"})
      } else {
        ElMessage(new_actor as string)
      }
    },

    iconActor(actor_name: string) {
      return `http://localhost:1314/_icon/${actor_name}.jfif`
    },
    styleActor(category: ActorCategory) {
      return `actor_${category.name}`
    },
    gotoActorPage(href: string) {
      window.open(href, '_blank', 'noreferrer');
    },
    openFolder(actor_name: string) {
      openActorFolder(actor_name)
    },
    formatPageCount(page: number) {
      if (page == 0) {
        return "All"
      }
      if (page == -1) {
        return "Posts"
      }

      return page.toString()
    },
    async startDownload(actor_name: string, page_limit: number) {
      let limit = DownloadLimitForm.NewForm(ActorCategory.Enough.value)
      limit.setPageLimit(page_limit)
      let [ok, ret] = [false, null]
      if (page_limit == -1) {
        [ok, ret] = await downloadAllPosts(limit, actor_name)
      } else {
        [ok, ret] = await downloadByNames(limit, [actor_name])
      }
      if (ok) {
        ElMessage({message: "download started", type: "success"})
      } else {
        ElMessage({message: ret as string, type: "error"})
      }
    },
    async setActorCategory() {
      const [ok, new_actor] = await changeActorCategory(this.actor.actor_name, this.actor.actor_category.value)
      this.onRecvUpdateMsg(ok, new_actor, "change category succeed")
    },
    onStartEditTag() {
      this.actor.editTags(true)
    },
    async onSubmitTag() {
      const [ok, new_actor] = await ChangeActorTag(this.actor.actor_name, this.actor._new_tag_list)
      this.onRecvUpdateMsg(ok, new_actor, "change tags succeed")
    },
    async onCancelAddTag() {
      this.actor.editTags(false)
    },
    async changeStar(star: boolean) {
      const [ok, new_actor] = await changeActorStar(this.actor.actor_name, star)
      this.onRecvUpdateMsg(ok, new_actor, "change star succeed")
    },
    async setActorRemark() {
      const [ok, new_actor] = await changeActorRemark(this.actor.actor_name, this.actor.remark)
      this.onRecvUpdateMsg(ok, new_actor, "change remark succeed")
    },
    async resetActor() {
      const [ok, new_actor] = await getActor(this.actor.actor_name)
      this.onRecvUpdateMsg(ok, new_actor, "reset actor succeed")
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

.tag_9 {
  background: lightgreen;
  color: #ffffff;
}

.tag_8 {
  background: lightgreen;
  color: #FF007F;
}

.tag_7 {
  background: lightgreen;
  color: #FFC0CB;
}

.tag_6 {
  background: lightgreen;
  color: #FFEE00;
}

.tag_5 {
  background: lightgray;
  color: #1EFF00;
}

.tag_4 {
  background: lightgray;
  color: #00FFFF;
}

.tag_3 {
  background: lightgray;
  color: #7F8EFF;
}

.tag_2 {
  background: lightgray;
  color: #7F8EFF;
}

.tag_1 {
  background: lightgray;
  color: #0000FF;
}

.tag_0 {
  background: lightgray;
  color: #0000FF;
}

.tag_error {
  background: #000000;
  color: #000000;
}

</style>