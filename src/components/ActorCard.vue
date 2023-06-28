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
            <el-button @click="gotoActorPage(actor.href)" :class="styleActor(actor.actor_category)">
              Go To Page
            </el-button>
            <el-button v-if="actor.hasFolder()" @click="openFolder(actor.actor_name)"
                       :class="styleActor(actor.actor_category)">
              Open Folder
            </el-button>
            <el-button v-if="actor.hasFolder()" @click="downloadAll(actor.actor_name)"
                       :class="styleActor(actor.actor_category)">
              Download All
            </el-button>
          </el-space>
        </template>
      </el-popover>

      <el-space v-if="actor.hasFolder()" direction="horizontal" alignment="center" wrap>
        <el-text style="font-size: 20px; color: sandybrown;" tag="ins">
          {{ `${actor.fileSize()}MB` }}
        </el-text>
        <el-text style="font-size: 16px; color: darkorange;" tag="ins">
          {{ actor.fileList() }}
        </el-text>
      </el-space>

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
                :style="{'font-size': '18px','background': 'lightblue','color': getTagColor(tag_id)}"
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
  openActorFolder
} from "../ctrls/ActorCtrl";
import {mapActions, mapState} from "pinia";
import {ActorTagStore} from "../store/ActorTagStore";
import {downloadByNames} from "../ctrls/DownloadCtrl";
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
    return {}
  },
  mounted() {

  },
  methods: {
    ...mapActions(ActorTagStore, {
      getTagName: 'getName',
      getTagColor: 'getColor',
    }),
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
    async downloadAll(actor_name: string) {
      const [ok, ret] = await downloadByNames(DownloadLimitForm.NewForm(ActorCategory.Enough.value), [actor_name])
      if (ok) {
        ElMessage({message: "download started", type: "success"})
      } else {
        ElMessage({message: ret as string, type: "error"})
      }
    },
    async setActorCategory() {
      const [ok, new_actor] = await changeActorCategory(this.actor.actor_name, this.actor.actor_category.value)
      if (ok) {
        this.actor_data.data = new_actor
        this.$emit('change', this.actor_data)
        ElMessage({message: "change category succeed", type: "success"})
      } else {
        ElMessage(new_actor as string)
      }
    },
    onStartEditTag() {
      this.actor.editTags(true)
    },
    async onSubmitTag() {
      const [ok, new_actor] = await ChangeActorTag(this.actor.actor_name, this.actor._new_tag_list)
      if (ok) {
        this.actor_data.data = new_actor
        this.$emit('change', this.actor_data)
        ElMessage({message: "change tags succeed", type: "success"})
      } else {
        ElMessage(new_actor as string)
      }
    },
    async onCancelAddTag() {
      this.actor.editTags(false)
    },
    async changeStar(star: boolean) {
      const [ok, new_actor] = await changeActorStar(this.actor.actor_name, star)
      if (ok) {
        this.actor_data.data = new_actor
        this.$emit('change', this.actor_data)
        ElMessage({message: "change star succeed", type: "success"})
      } else {
        ElMessage(new_actor as string)
      }
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