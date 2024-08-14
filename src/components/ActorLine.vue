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
        <el-tag v-for="tag_id in actor.rel_tags"
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
</template>

<script lang="ts">
import {ActorElement} from "../data/ArrayElement.js";
import ActorData from "../data/ActorData.js";
import {ActorGroupStore} from "../store/ActorGroupStore.js";
import {mapActions} from "pinia";
import {Star_Colors} from "../data/Consts";
import {ActorTagStore} from "../store/ActorTagStore";
import {changeActorRemark} from "../ctrls/ActorCtrl";
import SvgIcon from "./SvgIcon/index.vue";
import RemarkEditor from "./RemarkEditor.vue";
import {logInfo} from "../ctrls/FetchCtrl";

export default {
  name: "ActorLine",
  components: {SvgIcon, RemarkEditor},
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
      if (ok) {
        this.actor_data.data = new_actor
        logInfo("change remark succeed")
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