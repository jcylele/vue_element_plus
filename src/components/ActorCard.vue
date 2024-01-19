<template>
  <el-card class="box-card"
           :key="actor.actor_name"
           shadow="always"
           style="width: 200px;">
    <el-space direction="vertical" alignment="center" :fill="true">

      <!-- actor avatar -->
      <div style="position: relative;">
        <el-image :src="iconActor(actor.actor_name)" style="height: 180px"/>
        <svg-icon v-if="actor.main_actor" size="30px" name="friend"
                  @click="findLinkedActor"
                  style="color: hotpink;position: absolute; top: 0; left: 0;"/>
        <el-rate v-model="actor.show_score"
                 :colors="star_colors"
                 void-color="#FFFFFF"
                 size="large"
                 style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);"
                 @change="changeScore"
                 allow-half/>
      </div>

      <!-- actor name, click to open menu items -->
      <el-popover trigger="click" placement="top">
        <template #reference>
          <div :class="styleActor(actor.actor_category)"
               style="font-size: 20px; word-wrap: anywhere; text-align: center;">
            {{ actor.actor_name }}
          </div>
        </template>
        <template #default>
          <el-space direction="vertical" alignment="stretch">

            <el-button @click="gotoActorPage(actor.href)"
                       :class="styleActor(actor.actor_category)">
              Go To Page
            </el-button>

            <el-button v-if="actor.hasFolder()"
                       @click="openFolder(actor.actor_name)"
                       :class="styleActor(actor.actor_category)">
              Open Folder
            </el-button>

            <el-button v-if="actor.hasFolder()"
                       @click="showDownloadLimit"
                       :class="styleActor(actor.actor_category)">
              Download
            </el-button>

          </el-space>
        </template>
      </el-popover>

      <!-- download limit -->
      <el-dialog v-model="to_download"
                 title="Download"
                 width="500px">
        <el-space direction="vertical">
          <DownloadLimit :download_limit="download_limit"/>
          <el-space direction="horizontal" alignment="center">
            <el-button type="primary" @click="onSubmitDownload">
              Download
            </el-button>
            <el-button type="warning" @click="onCancelDownload">
              Cancel
            </el-button>
          </el-space>
        </el-space>
      </el-dialog>

      <!-- actor post info -->
      <el-text style="font-size: 16px; color: black;" tag="ins">
        {{ `[${actor.post_info[0]} / ${actor.post_info[1]}]` }}
      </el-text>
      <!-- actor res info -->
      <el-text v-for="res_file_info in actor.res_info"
               :class="'res' + res_file_info.res_state"
               style="font-size: 12px; ">
        {{ actor.formatResFileInfo(res_file_info) }}
      </el-text>

      <!--actor remark + category + edit button -->
      <el-space direction="horizontal" alignment="center">
        <!-- actor remark -->
        <el-popover placement="right" trigger="click" :width="600">
          <template #reference>
            <svg-icon size="20px" :name="actor.remark ? 'remark' : 'remark_empty'"/>
          </template>
          <template #default>
            <RemarkEditor :remark="actor.remark"
                          @submit="onSubmitRemark"
            />
          </template>
        </el-popover>
        <!-- actor category -->
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
        <!-- click to edit tags -->
        <svg-icon @click="onStartEditTag()"
                  size="20px" name="edit"/>
      </el-space>

      <!-- actor tags editing dialog-->
      <el-dialog v-model="is_editing_tags"
                 title="Edit Tags"
                 width="50%">
        <ActorTagChooser :editing_tags="editing_tags"
                         @submit="onSubmitTag"
                         @cancel="onCancelAddTag"
        />
      </el-dialog>


      <!--actor tags-->
      <el-space wrap>
        <el-tag v-for="tag_id in actor.rel_tags"
                :class="getColorStyleName(tag_id)"
                :style="{'font-size': '18px'}"
                round>
          {{ getTagName(tag_id) }}
        </el-tag>
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
  openActorFolder, changeActorRemark, getActor, getFileInfo, changeActorScore
} from "../ctrls/ActorCtrl";
import {mapActions, mapState} from "pinia";
import {ActorTagStore} from "../store/ActorTagStore";
import {downloadAllPosts, downloadByNames} from "../ctrls/DownloadCtrl";
import {DownloadLimitForm} from "../data/SimpleForms";
import ActorTagData from "../data/ActorTagData";
import SvgIcon from "./SvgIcon/index.vue";
import ActorTagChooser from "./ActorTagChooser.vue";
import DownloadLimit from "./DownloadLimit.vue";
import RemarkEditor from "./RemarkEditor.vue";

interface TagInfo {
  tag: ActorTagData,
  selected: boolean,
}

export default {
  name: "ActorCard",
  components: {DownloadLimit, ActorTagChooser, SvgIcon, RemarkEditor},
  // props from parent
  props: {
    actor_data: {data: ActorData, index: Number},
  },
  computed: {
    ...mapState(ActorTagStore, {
      actor_tag_list: 'sorted_list',
      actor_tag_grouped_list: 'grouped_list',
    }),
    actor(): ActorData {
      return this.actor_data.data
    },
    all_actor_category_list() {
      return ActorCategory.AllCategories
    }
  },
  // declare emitted events to parent
  emits: ['refresh', 'link'],
  data() {
    return {
      download_pages: [-1, 1, 2, 5, 10, 20, 0],
      is_editing_tags: false,
      editing_tags: [] as TagInfo[][],
      to_download: false,
      download_limit: null as DownloadLimitForm,
      star_colors: {
        0: '#0000FF',
        1: '#7F8EFF',
        2: '#1EFF00',
        3: '#FFEE00',
        4: '#FFA0AB',
        5: '#FF007F',
      }
    }
  },
  mounted() {
    // console.log(`mounted[${this.actor_data.index}]: ${this.actor.actor_name}`)
    this.actor.sortTags(this.compareActorTagId)
    this.getFileInfo()
  },
  methods: {
    ...mapActions(ActorTagStore, {
      getTagName: 'getName',
      getColorStyleName: 'getColorStyleName',
      compareActorTagId: 'compareActorTagId',
      getTagPriority: 'getTagPriority',
    }),

    // onCardAdd(){
    //   console.log(`onCardAdd[${this.actor_data.index}]: ${this.actor.actor_name}`)
    //   this.actor.sortTags(this.compareActorTagId)
    //   this.getFileInfo()
    // },

    onRecvActorMsg(ok: boolean, new_actor: ActorData, msg: string) {
      if (ok) {
        this.actor_data.data = new_actor
        this.actor.sortTags(this.compareActorTagId)
        this.$emit('refresh', this.actor_data)
        ElMessage({message: msg, type: "success"})

        // request file info
        this.getFileInfo()
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
    async setActorCategory() {
      if (this.actor.rel_tags.length == 0) {
        ElMessage({message: "no tags, can't set category", type: "warning"})
        return
      }
      if (this.actor.actor_category.value == ActorCategory.Enough.value
          && this.actor.score == 0) {
        ElMessage({message: "must set score before set category to enough", type: "warning"})
        return
      }
      const [ok, new_actor] = await changeActorCategory(this.actor.actor_name, this.actor.actor_category.value)
      this.onRecvActorMsg(ok, new_actor, "change category succeed")
    },
    onStartEditTag() {
      for (const group_id in this.actor_tag_grouped_list) {
        this.editing_tags[group_id] = []
        for (const tag_data: ActorTagData of this.actor_tag_grouped_list[group_id]) {
          const group = Math.floor(tag_data.tag_priority / 10)
          const hasTag = this.actor.hasTag(tag_data.tag_id)
          this.editing_tags[group].push({tag: tag_data, selected: hasTag})
        }
      }

      // console.log(this.editing_tags)

      this.is_editing_tags = true

    },
    async onSubmitTag() {
      this.is_editing_tags = false
      // merge all selected tags
      let new_tag_list = []
      for (const group of this.editing_tags) {
        for (const tag_info of group) {
          if (tag_info.selected) {
            new_tag_list.push(tag_info.tag.tag_id)
          }
        }
      }
      this.editing_tags = []
      // console.log(new_tag_list)

      //request
      const [ok, new_actor] = await ChangeActorTag(this.actor.actor_name, new_tag_list)
      this.onRecvActorMsg(ok, new_actor, "change tags succeed")
    },
    async onCancelAddTag() {
      this.is_editing_tags = false
      this.editing_tags = []
    },

    showDownloadLimit() {
      if (this.download_limit === null) {
        this.download_limit = new DownloadLimitForm()
        this.download_limit.resetDefaultValue(ActorCategory.Enough.value)
      }
      this.to_download = true
    },

    async onSubmitDownload() {
      this.to_download = false

      let [ok, ret] = await downloadByNames(this.download_limit, [this.actor.actor_name])
      if (ok) {
        ElMessage({message: "download started", type: "success"})
      } else {
        ElMessage({message: ret as string, type: "error"})
      }
    },

    onCancelDownload() {
      this.to_download = false
    },

    async changeStar(star: boolean) {
      const [ok, new_actor] = await changeActorStar(this.actor.actor_name, star)
      this.onRecvActorMsg(ok, new_actor, "change star succeed")
    },
    async changeScore() {
      const [ok, new_actor] = await changeActorScore(this.actor.actor_name, this.actor.score)
      this.onRecvActorMsg(ok, new_actor, "change score succeed")
    },
    async findLinkedActor() {
      this.$emit('link', this.actor_data)
    },
    async onSubmitRemark(new_remark: string) {
      if (new_remark == this.actor.remark) {
        return
      }
      const [ok, new_actor] = await changeActorRemark(this.actor.actor_name, new_remark)
      this.onRecvActorMsg(ok, new_actor, "change remark succeed")
    },
    async getFileInfo() {
      const [ok, file_info] = await getFileInfo(this.actor.actor_name)
      if (ok) {
        this.actor.res_info = file_info
      } else {
        ElMessage({message: file_info as string, type: "error"})
      }
    }
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

.res1 {
  color: darkgreen;
}

.res2 {
  color: hotpink;
}

.res3 {
  color: orangered;
}

.res4 {
  color: blue;
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