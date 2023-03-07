<template>
  <el-container>
    <el-main>
      <ActorFilter :filter_condition="filter_condition"
                   @change="onFilterChange"/>
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
                   :actor_data="actor_data"
                   :ref="(card) => { onActorCardAdd(actor_index, card) }"
                   @change="onActorChange"/>
      </el-space>
    </el-main>
  </el-container>
</template>

<script lang="ts">
import ActorData from "../data/ActorData";
import {ElMessage} from "element-plus";
import ActorFilterData from "../data/ActorFilterData";
import ActorFilter from "./ActorFilter.vue";
import ActorCard from "./ActorCard.vue";
import {IArrayElement, ToElementArray} from "../data/ArrayElement";
import {getActorCount, getActorList} from "../ctrls/ActorCtrl";
import {mapActions} from "pinia";
import {ActorTagStore} from "../store/ActorTagStore";

export default {
  components: {ActorCard, ActorFilter},
  data() {
    return {
      filter_condition: new ActorFilterData(),
      actor_list: [] as IArrayElement<ActorData>[],
      actor_cards: {} as Map<Number, ActorCard>,
      actor_size: 10,
      cur_actor_page: 1,
      actor_count: 0
    }
  },
  computed: {},
  methods: {
    ...mapActions(ActorTagStore, {
      getTagsFromServer: 'getFromServer',
    }),

    async onActorPageChange() {
      console.log(this.cur_actor_page)
      this.actor_cards = {}
      const [ok, actor_list] = await getActorList(this.filter_condition, this.actor_size, (this.cur_actor_page - 1) * this.actor_size)
      if (ok) {
        this.actor_list = ToElementArray(actor_list)
      } else {
        this.actor_list = []
        ElMessage(actor_list as string)
      }
    },
    async onFilterChange() {
      this.actor_list = []

      this.actor_count = 0
      const [ok, actor_count] = await getActorCount(this.filter_condition)
      if (ok) {
        this.actor_count = actor_count
      } else {
        ElMessage(actor_count as string)
      }

      this.cur_actor_page = 1
      await this.onActorPageChange()
    },
    onActorCardAdd(actor_index, actor_card) {
      this.actor_cards[actor_index] = actor_card
    },
    onActorChange(actor_data: IArrayElement<ActorData>) {
      console.log(`actor changed: ${actor_data.index}`)
    },
  },
  watch: {},
  async mounted() {
    await this.getTagsFromServer()
  }
}

</script>

<style scoped>

</style>