<template>
  <el-space direction="horizontal" size="large"
            class="actor_line" alignment="center"
            :key="actor.uuid"
            shadow="always"
            :style="{'color': getGroupColor(actor.actor_category)}"
  >
    <!-- left part: icon name -->
    <div style="position: relative;margin: 10px;height: 100px;width: 100px">
      <el-image :src="actor.icon"/>
      <el-rate v-model="actor.show_score"
               :colors="star_colors"
               void-color="#777777"
               size="small"
               style="position: absolute; bottom: 0; left: 50%; transform: translateX(-50%);"
               allow-half disabled/>
    </div>
    <!-- right part -->
    <el-space direction="vertical" alignment="start" size="small">
      <el-text class="actor_name">
        {{ actor.actor_name }}
      </el-text>
      <el-space direction="horizontal" wrap>
        <svg-icon @click="onStartEditTag"
                  size="24px" name="edit"/>
        <el-tag v-for="tag_id in actor.tag_ids"
                :class="getTagStyleName(tag_id)"
                style="font-size: 18px"
                round>
          {{ getTagName(tag_id) }}
        </el-tag>
      </el-space>
      <el-space direction="horizontal" alignment="start">
        <!-- remark icon -->
        <el-popover placement="right" trigger="click" :width="600">
          <template #reference>
            <svg-icon size="24px" :name="actor.remark ? 'remark' : 'remark_empty'"/>
          </template>
          <template #default>
            <RemarkEditor :remark="actor.remark"
                          @submit="onSubmitRemark"
            />
          </template>
        </el-popover>
        <el-space direction="vertical" alignment="start"> <!-- style="color: black" -->
          <el-text v-for="remark_item in actor.remark_list" @click="">
            {{ remark_item }}
          </el-text>
        </el-space>
      </el-space>
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
</template>

<script lang="ts">
import {ActorElement} from "../data/ArrayElement.js";
import ActorData from "../data/ActorData.js";
import {ActorGroupStore} from "../store/ActorGroupStore.js";
import {mapActions} from "pinia";
import {Star_Colors} from "../data/Consts";
import {ActorTagStore} from "../store/ActorTagStore";
import {changeActorRemark, ChangeActorTag} from "../ctrls/ActorCtrl";
import SvgIcon from "./SvgIcon/index.vue";
import RemarkEditor from "./RemarkEditor.vue";
import ActorTagChooser from "./ActorTagChooser.vue";
import {logInfo} from "../ctrls/FetchCtrl";

export default {
  name: "ActorLine",
  components: {SvgIcon, RemarkEditor, ActorTagChooser},
  props: {
    actor_data: ActorElement
  },
  computed: {
    actor(): ActorData {
      return this.actor_data.data
    },
    star_colors() {
      return Star_Colors
    }
  },
  data() {
    return {
      is_editing_tags: false,
    }
  },
  methods: {
    ...mapActions(ActorGroupStore, {
      getActorGroup: 'get',
    }),
    ...mapActions(ActorTagStore, {
      compareActorTagId: 'compareTagId',
      getTagStyleName: 'getStyleName',
      getTagName: 'getName',
    }),

    getGroupColor(group_id): string {
      let group = this.getActorGroup(group_id)
      return group.group_color
    },

    async onSubmitRemark(new_remark: string) {
      if (new_remark == this.actor.remark) {
        return
      }
      const [ok, new_actor] = await changeActorRemark(this.actor.actor_name, new_remark)
      this.onRecvActorMsg(ok, new_actor, "change remark succeed")
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

    onRecvActorMsg(ok: boolean, new_actor: ActorData, msg: string) {
      if (ok) {
        this.actor_data.data = new_actor
        this.actor.sortTags(this.compareActorTagId)
        logInfo(msg)
      }
    },
  },
  mounted() {
    // console.log(`mounted[${this.actor_data.id}]: ${this.actor.actor_name}`)
    this.actor.sortTags(this.compareActorTagId)
  },
}
</script>

<style scoped>
.actor_line {
  border: 1px solid;
  /*padding: 2px;*/
  box-shadow: 2px 2px;
  min-height: 120px;
}

.actor_name {
  font-size: 20px;
}

</style>