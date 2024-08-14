<template>
  <el-space direction="vertical" :fill="true">
    <el-collapse v-model="active_parts">
      <!-- link actors group -->
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
      <!-- filter conditions -->
      <el-collapse-item name="filter" title="Actor Filter">
        <el-space direction="vertical">
          <ActorFilter :filter_condition="filter_condition" @change="onFilterChange"/>
        </el-space>
      </el-collapse-item>
    </el-collapse>
    <!-- tools menu -->
    <el-space direction="horizontal" size="large" spacer="|">
      <el-pagination
          v-model:current-page="cur_actor_page"
          :page-size="actor_size"
          :page-sizes="[10, 14]"
          :total="actor_count"
          @current-change="onActorPageChange"
          @size-change="handleSizeChange"
          layout="sizes, total, prev, pager, next"
          background
          style="margin: 5px"
      />
      <el-popover trigger="click" placement="right" width="200px">
        <template #reference>
          <el-button>Operate These Actors</el-button>
        </template>
        <template #default>
          <el-space direction="vertical" style="width: 180px" :fill="true">
            <!-- download -->
            <el-button @click="batchShowDownload">
              Batch Download
            </el-button>
            <!-- actor category -->
            <el-select placeholder="Batch Set Category"
                       @change="batchSetActorCategory">
              <el-option
                  v-for="group in group_list"
                  :label="group.show_content"
                  :value="group.group_id"
                  :style="{'color': group.group_color, }"
              />
            </el-select>
          </el-space>
        </template>
      </el-popover>
      <!--        <el-text style="font-style: italic;font-weight: bold;margin-left: 10px;">-->
      <!--          Show Type-->
      <!--        </el-text>-->
      <el-select v-model="actor_show_type" style="min-width: 100px">
        <el-option
            v-for="option in actor_show_options"
            :label="option.label"
            :value="option.value"
        />
      </el-select>
      <el-button type="primary" @click="showPosts">
        Posts
      </el-button>
    </el-space>
    <!-- a big card per actor -->
    <draggable v-if="actor_show_card"
               v-model="actor_list"
               :group="{ name: 'actors', pull: 'clone', put: false }"
               class="card_row">
      <!-- TODO change is not triggered, why   -->
      <!-- specify a key is essential when using v-for, otherwise mounted may not be called when data is changed   -->
      <ActorCard v-for="actor_data in actor_list"
                 :actor_data="actor_data"
                 :key="actor_data.id"
                 @refresh="onActorChange"
                 @link="onActorLinkClick"
                 @download="singleShowDownload"
                 @post="showActorPosts"
                 class="card"/>
    </draggable>
    <!-- a line per actor -->
    <el-space v-if="actor_show_line" direction="vertical" size="small" :fill="true">
      <ActorLine v-for="actor_data in actor_list"
                 :actor_data="actor_data"
                 :key="actor_data.id"/>
    </el-space>
    <!-- download  dialog -->
    <el-dialog v-model="is_show_download"
               :title="download_title"
               :before-close="onDownloadClose"
               width="640px">
      <el-space direction="vertical">
        <DownloadLimit :download_limit="download_limit"/>
        <el-space direction="horizontal" alignment="center">
          <el-button type="primary" @click="onSubmitDownload">
            Download
          </el-button>
          <el-button type="warning" @click="onDownloadClose">
            Cancel
          </el-button>
        </el-space>
      </el-space>
    </el-dialog>
    <el-dialog v-model="is_show_post"
               title="Posts"
               width=720px>
      <Posts></Posts>
    </el-dialog>
  </el-space>
</template>

<script lang="ts">
import ActorFilterData from "../data/ActorFilterData";
import ActorFilter from "./ActorFilter.vue";
import ActorCard from "./ActorCard.vue";
import {ActorElement, ToActorElements} from "../data/ArrayElement";
import {
  batchChangeActorCategory,
  getActorCount,
  getActorList,
  getLinkedActors,
  linkSameActors
} from "../ctrls/ActorCtrl";
import {mapActions, mapState} from "pinia";
import {ActorTagStore} from "../store/ActorTagStore";
import {ActorFilterStore} from "../store/ActorFilterStore";
import {VueDraggableNext} from "vue-draggable-next";
import {DownloadLimitForm} from "../data/SimpleForms";
import {downloadByNames} from "../ctrls/DownloadCtrl";
import DownloadLimit from "./DownloadLimit.vue";
import {ActorGroupStore} from "../store/ActorGroupStore";
import {ActorShowType, LimitPreset} from "../data/Enums";
import {Actor_Show_Options} from "../data/Consts";
import ActorLine from "./ActorLine.vue";
import Posts from "./Posts.vue";
import {logInfo, logWarn} from "../ctrls/FetchCtrl";

export default {
  components: {Posts, ActorLine, ActorCard, ActorFilter, draggable: VueDraggableNext, DownloadLimit},
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
      download_actor_names: [] as string[],
      download_limit: null as DownloadLimitForm,
      actor_show_type: ActorShowType.Card,
      is_show_post: false,
    }
  },
  computed: {
    ...mapState(ActorFilterStore, {cached_filter_condition: 'filter_condition'}),
    ...mapState(ActorGroupStore, {group_list: 'sorted_list'}),
    is_show_download() {
      return this.download_actor_names.length > 0
    },
    download_title() {
      const count = this.download_actor_names.length
      switch (count) {
        case 0:
          return ""
        case 1:
          return this.download_actor_names[0]
        default: {
          let names = this.download_actor_names.join(",")
          if (names.length > 30) {
            names = names.substring(0, 30)
            names += "..."
          }
          return names
        }
      }
    },
    actor_show_options() {
      return Actor_Show_Options
    },
    actor_show_card() {
      return this.actor_show_type == ActorShowType.Card
    },
    actor_show_line() {
      return this.actor_show_type == ActorShowType.Line
    }
  },
  methods: {
    ...mapActions(ActorTagStore, {
      getTagsFromServer: 'getFromServer',
    }),
    ...mapActions(ActorFilterStore, {
      saveFilterCondition: 'setFilterCondition',
    }),
    ...mapActions(ActorGroupStore, {
      getGroupsFromServer: 'getFromServer',
    }),

    async handleSizeChange(val: number) {
      this.actor_size = val
      this.cur_actor_page = 1
      await this.onActorPageChange()
    },

    async onActorPageChange() {
      const [ok, actor_list] = await getActorList(this.filter_condition, this.actor_size, (this.cur_actor_page - 1) * this.actor_size)
      if (ok) {
        this.actor_list = ToActorElements(actor_list)
      } else {
        this.actor_list = []
      }
    },
    async onFilterChange() {
      this.saveFilterCondition(this.filter_condition)

      this.actor_list = []
      this.actor_count = 0
      const [ok, actor_count] = await getActorCount(this.filter_condition)
      if (ok) {
        this.actor_count = actor_count
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
      }
    },
    async linkActors() {
      if (this.linked_list.length < 2) {
        logWarn("No actor to link")
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
      }
    },

    clearLinkedActors() {
      this.linked_list = []
    },

    showDownloadLimit(name_list: string[]) {
      this.download_actor_names = name_list
      if (this.download_limit == null) {
        this.download_limit = new DownloadLimitForm()
        this.download_limit.resetDefaultValue(LimitPreset.Current_Init)
      }
    },

    singleShowDownload(actor_data: ActorElement) {
      this.showDownloadLimit([actor_data.data.actor_name])
    },

    batchShowDownload() {
      let name_list = this.actor_list.map(element => element.data.actor_name)
      this.showDownloadLimit(name_list)
    },

    async onSubmitDownload() {
      let [ok, _] = await downloadByNames(this.download_limit, this.download_actor_names)
      this.onDownloadClose()
      if (ok) {
        logInfo("download started")
      }
    },

    onDownloadClose() {
      this.download_actor_names = []
    },

    async batchSetActorCategory(category: number) {
      let name_list = this.actor_list.map(element => element.data.actor_name)
      let [ok, actor_list] = await batchChangeActorCategory(name_list, category)
      if (ok) {
        this.actor_list = ToActorElements(actor_list)
      } else {
        this.actor_list = []
      }
    },

    showPosts() {
      this.is_show_post = true
    },
  },
  watch: {},
  async mounted() {
    this.filter_condition = this.cached_filter_condition
    await this.getTagsFromServer()
    await this.getGroupsFromServer()
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