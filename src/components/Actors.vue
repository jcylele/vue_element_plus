<template>
  <el-container>
    <el-main>
      <ActorFilter :actor_tag_list="actor_tag_list"
                   :filter_condition="filter_condition"
                   @change="onFilterConditionChange"/>
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
        <!-- :actor_index="actor_index"
        :actor="actor"
                   :actor_index="actor_index"
        -->
        <ActorCard v-for="actor_data in actor_list"
                   :actor_tag_list="actor_tag_list"

                   :actor_data="actor_data"
                   :ref="(card) => { onActorCardAdd(actor_index, card) }"
                   @change="onActorChange"/>
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
import ActorFilterData from "../data/ActorFilterData";
import ActorFilter from "./ActorFilter.vue";
import ActorCard from "./ActorCard.vue";
import {IArrayElement, ToElementArray} from "../data/ArrayElement";

export default {
  components: {ActorCard, ActorFilter},
  data() {
    return {
      filter_condition: new ActorFilterData(),
      actor_tag_list: [] as ActorTagData[],
      actor_list: [] as IArrayElement[],
      actor_cards: {} as Map<Number, ActorCard>,
      actor_size: 10,
      cur_actor_page: 1,
      actor_count: 0
    }
  },
  computed: {},
  methods: {
    async onActorPageChange() {
      console.log(this.cur_actor_page)
      this.actor_cards = {}
      const [ok, actor_list] = await ActorCtrl.getActorList(this.filter_condition, this.actor_size, (this.cur_actor_page - 1) * this.actor_size)
      if (ok) {
        this.actor_list = ToElementArray(actor_list)
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
    async getActorTagList() {
      const [ok, tag_list] = await ActorTagCtrl.getActorTagList()
      if (ok) {
        this.actor_tag_list = tag_list as ActorTagData[]
      } else {
        ElMessage(tag_list as string)
      }
    },
    onActorCardAdd(actor_index, actor_card){
      this.actor_cards[actor_index] = actor_card
    },
    onActorChange(actor_data: IArrayElement) {
      this.actor_list[actor_data.index] = actor_data
    },
  },
  watch: {},
  async mounted() {
    await this.getActorTagList()
    // await this.onFilterConditionChange()
  }
}

</script>

<style scoped>

</style>