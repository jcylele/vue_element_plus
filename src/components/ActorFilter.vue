<template>
  <el-space direction="vertical" :fill="true">
    <el-space direction="horizontal" alignment="flex-start" class="filter">
      <el-checkbox size="large" border v-model="filter_condition.show_category">Category</el-checkbox>
      <el-checkbox size="large" border v-model="filter_condition.show_tag">Tag</el-checkbox>
      <el-checkbox size="large" border v-model="filter_condition.show_score">Star</el-checkbox>
      <el-checkbox size="large" border v-model="filter_condition.show_name">Name</el-checkbox>
      <el-checkbox size="large" border v-model="filter_condition.show_remark">Remark</el-checkbox>
      <el-checkbox size="large" border v-model="filter_condition.show_sort">Sort</el-checkbox>
      <el-divider direction="vertical"/>
      <el-button type="primary" @click="onFilterChange">Search</el-button>
      <el-button @click="onFilterCancel">Reset</el-button>
      <el-button v-if="filter_history.length > 0" type="success" @click="toPreviousFilter">Previous</el-button>

    </el-space>
    <el-form :model="filter_condition"
             label-width="auto"
             label-position="right"
             size="large">

      <!-- filter category -->
      <el-form-item label="Category" v-if="filter_condition.show_category">
        <el-checkbox-group
            v-model="filter_condition.category_list"
            @change="onCheckedCategoryChange">
          <el-checkbox-button v-for="group in actor_group_list"
                              :label="group.group_id">
            {{ group.group_name }}
          </el-checkbox-button>
        </el-checkbox-group>

        <el-switch
            v-model="is_category_all"
            size="large"
            active-text="All"
            inactive-text="None"
            style="margin-left: 10px"
        />

      </el-form-item>

      <!-- filter tags -->
      <el-form-item label="Tags" v-if="filter_condition.show_tag">
        <el-select v-model="filter_condition.tag_list"
                   @change="onCheckedTagChange"
                   style="width: 200px;"
                   multiple filterable clearable>
          <el-option
              v-for="actor_tag in actor_tag_list"
              :key="actor_tag.tag_id"
              :label="actor_tag.tag_name"
              :value="actor_tag.tag_id"
          />
        </el-select>
        <el-checkbox v-model="filter_condition.no_tag"
                     @change="checkNoTag"
                     style="margin-left: 10px;font-size: 24px;"
                     size="large"
                     border>
          No Tag
        </el-checkbox>
      </el-form-item>

      <!-- score -->
      <el-form-item label="Star" v-if="filter_condition.show_score">
        <el-rate v-model="filter_condition.show_min_score"
                 :colors="star_colors"
                 void-color="#777777"
                 size="large"
                 allow-half/>
        <el-text>~</el-text>
        <el-rate v-model="filter_condition.show_max_score"
                 :colors="star_colors"
                 void-color="#777777"
                 size="large"
                 allow-half/>
      </el-form-item>

      <!-- filter name -->
      <el-form-item label="Name" v-if="filter_condition.show_name">
        <el-input v-model="filter_condition.name"
                  style="width: 200px; font-size: 24px; margin-right: 20px"
                  clearable/>
      </el-form-item>

      <!-- remark -->
      <el-form-item label="Remark" v-if="filter_condition.show_remark">
        <el-input v-model="filter_condition.remark_str"
                  style="width: 200px; font-size: 24px; margin-right: 20px"
                  clearable/>
        <el-checkbox v-model="filter_condition.remark_any"
                     @change="checkNoTag"
                     style="margin-left: 10px;font-size: 24px;"
                     size="large"
                     border>
          Any Remark
        </el-checkbox>
      </el-form-item>

      <!-- Sort_Options -->
      <el-form-item label="Sort" v-if="filter_condition.show_sort">
        <el-select v-model="filter_condition.show_sort_id"
                   style="width: 200px;">
          <el-option
              v-for="sort_option in sort_option_list"
              :label="sort_option.label"
              :value="sort_option.id"
          />
        </el-select>
      </el-form-item>
    </el-form>
  </el-space>
</template>

<script lang="ts">
import ActorFilterData from "../data/ActorFilterData";
import NewActorTag from "./NewActorTag.vue";
import {mapState} from "pinia";
import {ActorTagStore} from "../store/ActorTagStore";
import {ActorGroupStore} from "../store/ActorGroupStore";
import {Sort_Options, Star_Colors} from "../data/Consts";

export default {
  name: "ActorFilter",
  // props from parent
  props: {
    filter_condition: ActorFilterData
  },
  // declare emitted events to parent
  emits: ['change'],
  components: {NewActorTag},
  data() {
    return {
      is_category_all: false,
      filter_history: [] as ActorFilterData[]
    }
  },

  computed: {
    ...mapState(ActorTagStore, {actor_tag_list: 'sorted_list'}),
    ...mapState(ActorGroupStore, {actor_group_list: 'sorted_list'}),
    sort_option_list() {
      return Sort_Options
    },
    star_colors() {
      return Star_Colors
    },
  },

  watch: {
    async is_category_all(new_val, _) {
      if (new_val) {
        this.fillAllCategory()
      }
      this.filter_condition.checkAllCategory(new_val)
    }
  },

  methods: {
    //
    checkNoTag(val: boolean) {
      this.filter_condition.checkNoTag(val)
    },
    //dd
    onCheckedTagChange() {
      this.filter_condition.onCheckedTagChange()
    },
    onCheckedCategoryChange(val: number[]) {
    },
    async onFilterChange() {
      this.filter_history.push(this.filter_condition.clone())
      this.$emit('change')
    },
    onFilterCancel() {
      this.filter_condition.reset()
    },
    async toPreviousFilter() {
      if (this.filter_history.length > 0) {
        this.filter_condition.copy(this.filter_history.pop())
      }
    },
    fillAllCategory() {
      this.filter_condition.setAllCategoryList(this.actor_group_list.map(group => group.group_id))
    }
  },
  mounted() {

  }
}
</script>

<style scoped>
.filter {

}

.filter el-checkbox {
  font-size: 24px;
  font-style: italic;
}

.filter-divider {
  margin: 2px;
  color: black;
}
</style>