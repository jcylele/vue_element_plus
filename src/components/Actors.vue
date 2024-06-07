<template>
  <el-container>
    <el-main>
      <el-collapse v-model="active_parts">
        <el-collapse-item name="link" title="Linked Actors">
          <el-space direction="horizontal">

            <el-space direction="vertical" :alignment="'stretch'">
              <el-button type="primary" @click="linkActors">Link</el-button>
              <el-button type="danger" @click="clearLinkedActors">Clear</el-button>
            </el-space>

            <!-- linked actors -->
            <draggable v-model="linked_list"
                       :group="{ name: 'actors', pull: false, put: true }"
                       class="card_row">
              <!-- specify a key is essential when using v-for, otherwise mounted may not be called when data is changed   -->
              <ActorCard v-for="actor_data in linked_list"
                         :actor_data="actor_data"
                         :key="actor_data.data.actor_name"
                         class="card"/>
            </draggable>
          </el-space>
        </el-collapse-item>

        <el-collapse-item name="filter" title="Actor Filter">
          <el-space direction="vertical">
            <ActorFilter :filter_condition="filter_condition" @change="onFilterChange"/>
          </el-space>
        </el-collapse-item>
      </el-collapse>
      <!--      <el-divider/>-->
      <el-pagination
          v-model:current-page="cur_actor_page"
          :page-size="actor_size"
          :page-sizes="[10, 14]"
          :total="actor_count"
          @current-change="onActorPageChange"
          @size-change="handleSizeChange"
          layout="sizes, total, prev, pager, next"
          background
          style="margin: 10px"
      />
      <!--      <el-space wrap size="large" alignment="stretch">-->
      <draggable v-model="actor_list"
                 :group="{ name: 'actors', pull: 'clone', put: false }"
                 class="card_row">
        <!-- TODO change is not triggered, why   -->
        <!-- specify a key is essential when using v-for, otherwise mounted may not be called when data is changed   -->
        <ActorCard v-for="actor_data in actor_list"
                   :actor_data="actor_data"
                   :key="actor_data.id"
                   @refresh="onActorChange"
                   @link="onActorLinkClick"
                   class="card"/>
      </draggable>
      <!--      </el-space>-->
    </el-main>
  </el-container>
</template>

<script lang="ts">
import ActorData from "../data/ActorData";
import {ElMessage} from "element-plus";
import ActorFilterData from "../data/ActorFilterData";
import ActorFilter from "./ActorFilter.vue";
import ActorCard from "./ActorCard.vue";
import {ActorElement, ToActorElements} from "../data/ArrayElement";
import {getActorCount, getActorList, getLinkedActors, linkSameActors} from "../ctrls/ActorCtrl";
import {mapActions, mapState} from "pinia";
import {ActorTagStore} from "../store/ActorTagStore";
import {ActorFilterStore} from "../store/ActorFilterStore";
import {VueDraggableNext} from "vue-draggable-next";

export default {
  components: {ActorCard, ActorFilter, draggable: VueDraggableNext},
  data() {
    return {
      filter_condition: new ActorFilterData(),
      actor_list: [] as ActorElement[],
      // actor_cards: {} as Map<Number, ActorCard>,
      actor_size: 10,
      cur_actor_page: 1,
      actor_count: 0,
      active_parts: ['filter'],
      linked_list: [] as ActorElement[],
    }
  },
  computed: {
    ...mapState(ActorFilterStore, {cached_filter_condition: 'filter_condition'}),
  },
  methods: {
    ...mapActions(ActorTagStore, {
      getTagsFromServer: 'getFromServer',
    }),
    ...mapActions(ActorFilterStore, {
      saveFilterCondition: 'setFilterCondition',
    }),

    async handleSizeChange(val: number) {
      this.actor_size = val
      this.cur_actor_page = 1
      await this.onActorPageChange()
    },

    async onActorPageChange() {
      // console.log(this.cur_actor_page)
      const [ok, actor_list] = await getActorList(this.filter_condition, this.actor_size, (this.cur_actor_page - 1) * this.actor_size)
      if (ok) {
        this.actor_list = ToActorElements(actor_list)
      } else {
        this.actor_list = []
        ElMessage(actor_list as string)
      }
    },
    async onFilterChange() {
      this.saveFilterCondition(this.filter_condition)

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
    onActorChange(actor_data: ActorElement) {
      console.log(`actor changed: ${actor_data.data.actor_name}`)
    },
    async onActorLinkClick(actor_data: ActorElement) {
      console.log(`actor link clicked: ${actor_data.data.actor_name}`)
      const [ok, actor_list] = await getLinkedActors(actor_data.data.actor_name)
      if (ok) {
        this.actor_list = ToActorElements(actor_list)
      } else {
        this.actor_list = []
        ElMessage(actor_list as string)
      }
    },
    async linkActors() {
      if (this.linked_list.length < 2) {
        ElMessage.warning("No actor to link")
        return
      }

      const actor_name_list = this.linked_list.map((actor) => actor.data.actor_name)
      const [ok, actor_map] = await linkSameActors(actor_name_list)
      if (ok) {
        for (const actor_data of this.linked_list) {
          if (actor_data.data.actor_name in actor_map) {
            actor_data.data = actor_map[actor_data.data.actor_name]
          }
        }
      } else {
        this.linked_list = []
        ElMessage.error(actor_map as string)
      }
    },

    clearLinkedActors() {
      this.linked_list = []
    },

  },
  watch: {},
  async mounted() {
    this.filter_condition = this.cached_filter_condition
    await this.getTagsFromServer()
  }
}

</script>

<style scoped>
.card {
  display: table-cell;
  margin: 10px;
}

.card_row {
  min-height: 100px;
  min-width: 300px;
  display: flex;
  flex-wrap: wrap;
}
</style>