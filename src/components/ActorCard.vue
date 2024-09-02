<template>
  <el-space direction="vertical"
            class="actor_card" alignment="stretch" :size="3"
            :key="actor.uuid"
            :style="{'color': group_color}">

    <!-- actor avatar -->
    <div class="avatar">
      <el-image class="avatar-img" :src="actor.icon"/>
      <svg-icon v-if="actor.has_main_actor"
                size="30px" name="friend"
                style="position: absolute;top: 0;left: 15px;"
                @click="findLinkedActor"/>

      <svg-icon v-if="show_link"
                size="30px" name="top"
                style="position: absolute;top: 0;right: 15px;"
                class="blink-class"
                @click="onLinkClick"/>

      <el-rate class="avatar-rate"
               v-model="actor.show_score"
               :colors="star_colors"
               void-color="#777777"
               size="large"
               @change="changeScore"
               allow-half/>
    </div>

    <!-- actor name, click to open menu items -->
    <el-popover trigger="click" placement="top"
                v-model:visible="is_show_op"
                :popper-style="{'border-color': group_color, 'width': 300}"
                popper-class="op_popper"
                :offset="6">
      <template #reference>
        <el-text class="actor_name" :style="{'color': group_color}">
          {{ actor.actor_name }}
        </el-text>
      </template>
      <template #default>
        <el-space direction="vertical" alignment="center">
          <el-space direction="horizontal">
            <el-button class="pop-button"
                       type="primary"
                       @click="showPosts">
              Show Posts
            </el-button>
            <el-button class="pop-button"
                       type="primary"
                       @click="gotoActorPage">
              Go To Page
            </el-button>
          </el-space>
          <el-space direction="horizontal" v-if="hasFolder()">
            <el-button class="pop-button"
                       type="warning"
                       @click="resetPosts">
              Reset Posts
            </el-button>
            <el-button class="pop-button"
                       type="warning"
                       @click="clearFolder">
              Clear Folder
            </el-button>
          </el-space>
          <el-space direction="horizontal" v-if="hasFolder()">
            <el-button class="pop-button"
                       type="success"
                       @click="toDownload"
                       v-if="hasFolder()">
              Download
            </el-button>
            <el-button class="pop-button"
                       type="success"
                       @click="openFolder"
                       v-if="hasFolder()">
              Open Folder
            </el-button>
          </el-space>
        </el-space>
      </template>
    </el-popover>

    <!-- actor post info -->
    <el-space direction="vertical"
              v-if="actor.file_info"
              alignment="start"
              style="gap: 1px 0px;padding-left: 15px">
      <el-text style="font-size: 18px; color: black;" tag="ins">
        {{ actor.post_desc }}
      </el-text>
      <!-- actor res info -->
      <el-text v-for="res_file_info in actor.file_info.res_info"
               :class="'res' + res_file_info.res_state"
               style="font-size: 14px; ">
        {{ actor.formatResFileInfo(res_file_info) }}
      </el-text>
    </el-space>

    <!--actor remark + category + edit button -->
    <el-space direction="horizontal" alignment="stretch">
      <!-- actor remark -->
      <el-popover placement="right" trigger="click" :width="600">
        <template #reference>
          <svg-icon size="24px"
                    :name="actor.remark ? 'remark' : 'remark_empty'"
          />
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
                 style="width: 140px"
      >
        <el-option
            v-for="group in group_list"
            :label="group.group_name"
            :value="group.group_id"
            :style="{'color': group.group_color, 'text-decoration':'underline' }"
        >
          {{ group.show_content }}
        </el-option>
      </el-select>
      <!-- click to edit tags -->
      <svg-icon @click="onStartEditTag()"
                size="24px"
                name="edit"/>
    </el-space>

    <!--actor tags-->
    <el-space wrap style="margin-top: 5px">
      <el-tag v-for="tag_id in actor.tag_ids"
              :class="getTagStyleName(tag_id)"
              style="font-size: 18px"
              round>
        {{ getTagName(tag_id) }}
      </el-tag>
    </el-space>
  </el-space>
  <!-- actor tags editing dialog-->
  <el-dialog v-model="is_editing_tags"
             :title="actor.actor_name"
             width="67%">
    <ActorTagChooser :actor="actor"
                     @submit="onSubmitTag"
                     @cancel="onCancelAddTag"
    />
  </el-dialog>
  <el-dialog v-model="is_show_post"
             title="Posts"
             width=720px>
    <Posts :specific_actor_name="actor.actor_name"></Posts>
  </el-dialog>
</template>

<script lang="ts">
import ActorData from "../data/ActorData";
import {
  ChangeActorTag,
  changeActorCategory,
  openActorFolder, changeActorRemark, getFileInfo, changeActorScore, clearActorFolder, resetActorPosts
} from "../ctrls/ActorCtrl";
import {mapActions, mapState} from "pinia";
import {ActorTagStore} from "../store/ActorTagStore";
import SvgIcon from "./SvgIcon/index.vue";
import ActorTagChooser from "./ActorTagChooser.vue";
import RemarkEditor from "./RemarkEditor.vue";
import Posts from "./Posts.vue";
import {ActorElement} from "../data/ArrayElement";
import {ActorGroupStore} from "../store/ActorGroupStore";
import ActorGroupData from "../data/ActorGroupData";
import {Star_Colors} from "../data/Consts";
import {logInfo, logWarn} from "../ctrls/FetchCtrl";

export default {
  name: "ActorCard",
  components: {ActorTagChooser, SvgIcon, RemarkEditor, Posts},
  // props from parent
  props: {
    actor_data: ActorElement,
    show_link: Boolean
  },
  computed: {
    ...mapState(ActorGroupStore, {group_list: 'sorted_list'}),
    actor(): ActorData {
      return this.actor_data.data
    },
    star_colors() {
      return Star_Colors
    },
    group_color(): string {
      let group = this.getActorGroup(this.actor_data.data.actor_category)
      return group.group_color
    },
  },
  // declare emitted events to parent
  emits: ['refresh', 'link', 'download', 'friend'],
  data() {
    return {
      is_editing_tags: false,
      is_show_post: false,
      is_show_op: false
    }
  },
  mounted() {
    // console.log(`mounted[${this.actor_data.id}]: ${this.actor.actor_name}`)
    this.actor.sortTags(this.compareActorTagId)
    this.getFileInfo()
  },
  methods: {
    ...mapActions(ActorTagStore, {
      compareActorTagId: 'compareTagId',
      getTagStyleName: 'getStyleName',
      getTagName: 'getName',
    }),

    ...mapActions(ActorGroupStore, {
      getActorGroup: 'get',
    }),

    getActorGroupData(): ActorGroupData {
      let category_id = this.actor_data.data.actor_category
      return this.getActorGroup(category_id)
    },

    hasFolder(): boolean {
      let group = this.getActorGroupData()
      return group.has_folder
    },

    onRecvActorMsg(ok: boolean, new_actor: ActorData, msg: string) {
      if (ok) {
        this.actor_data.data = new_actor
        this.actor.sortTags(this.compareActorTagId)
        this.$emit('refresh', this.actor_data)
        logInfo(msg)
        // request file info
        this.getFileInfo()
      }
    },

    gotoActorPage() {
      this.is_show_op = false
      window.open(this.actor.href, '_blank', 'noreferrer');
    },
    openFolder() {
      this.is_show_op = false
      openActorFolder(this.actor.actor_name)
    },
    async clearFolder() {
      this.is_show_op = false
      const [ok, file_info] = await clearActorFolder(this.actor.actor_name)
      if (ok) {
        this.setFileInfo(file_info)
        logInfo("clear folder succeed")
      }
    },
    async resetPosts() {
      this.is_show_op = false
      const [ok, file_info] = await resetActorPosts(this.actor.actor_name)
      if (ok) {
        this.setFileInfo(file_info)
        logInfo("reset posts succeed")
      }
    },
    async setActorCategory() {
      if (this.actor.tag_ids.length == 0) {
        logWarn("add any tag before setting category")
        return
      }
      const [ok, new_actor] = await changeActorCategory(this.actor.actor_name, this.actor.actor_category)
      this.onRecvActorMsg(ok, new_actor, "change category succeed")
    },
    onStartEditTag() {
      this.is_editing_tags = true
    },
    async onSubmitTag(new_tag_list: number[]) {
      this.is_editing_tags = false

      //request
      const [ok, new_actor] = await ChangeActorTag(this.actor.actor_name, new_tag_list)
      this.onRecvActorMsg(ok, new_actor, "change tags succeed")
    },
    async onCancelAddTag() {
      this.is_editing_tags = false
    },

    toDownload() {
      this.is_show_op = false
      this.$emit('download', this.actor_data)
    },

    showPosts() {
      this.is_show_op = false
      this.is_show_post = true
    },

    async changeScore() {
      const [ok, new_actor] = await changeActorScore(this.actor.actor_name, this.actor.score)
      this.onRecvActorMsg(ok, new_actor, "change score succeed")
    },
    async findLinkedActor() {
      this.$emit('friend', this.actor_data)
    },
    onLinkClick() {
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
        this.setFileInfo(file_info)
      }
    },
    setFileInfo(file_info) {
      this.actor.file_info = file_info
    },
  }
  ,
}
</script>

<style scoped>

.actor_name {
  font-size: 20px;
  word-wrap: anywhere;
  text-align: center;
}

.actor_card {
  border: 1px solid;
  padding: 2px;
  box-shadow: 2px 2px;
  width: 210px;
}

.avatar {
  position: relative;
  /*width: 180px;*/
  height: 180px;
  margin-top: 15px;
}

.avatar-img {
  width: 180px;
  height: 180px;
  position: absolute;
  top: 0;
  left: 15px;
}

.avatar-rate {
  position: absolute;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
}

.pop-button {
  width: 126px;
  height: 32px;
  font-size: 16px;
}

.blink-class {
  animation: blink 1s linear infinite;
}

@keyframes blink {
  25% {
    opacity: 0.5;
  }
  50% {
    opacity: 0;
  }
  75% {
    opacity: 0.5;
  }
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


</style>