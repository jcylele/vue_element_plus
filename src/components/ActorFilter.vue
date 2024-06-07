<template>
  <el-space direction="vertical" :fill="true">
    <el-space direction="horizontal" alignment="flex-start">
      <el-checkbox v-model="filter_condition.show_category">Category</el-checkbox>
      <el-checkbox v-model="filter_condition.show_tag">Tag</el-checkbox>
      <el-checkbox v-model="filter_condition.show_score">Star</el-checkbox>
      <el-checkbox v-model="filter_condition.show_name">Name</el-checkbox>
      <el-divider direction="vertical"/>
      <el-button type="primary" @click="onFilterChange">Search</el-button>
      <el-button @click="onFilterCancel">Reset</el-button>
      <el-button v-if="filter_history.length > 0" type="success" @click="toPreviousFilter">Previous</el-button>

    </el-space>
    <el-form :model="filter_condition"
             label-width="100px" label-position="left">

      <!-- filter category -->
      <el-form-item label="Category" v-if="filter_condition.show_category">
        <el-checkbox-group
            v-model="filter_condition.category_list"
            @change="onCheckedCategoryChange">
          <el-checkbox-button v-for="category in all_actor_category_list"
                              :key="category.value"
                              :label="category.value">
            {{ category.name }}
          </el-checkbox-button>
        </el-checkbox-group>

        <el-checkbox
            size="large" border
            style="margin-left: 10px"
            v-model="filter_condition.is_category_all"
            :indeterminate="filter_condition.is_category_partial"
            @change="checkAllCategory">
          All
        </el-checkbox>
      </el-form-item>

      <!-- filter tags -->
      <el-form-item label="Tags" v-if="filter_condition.show_tag">
        <el-select v-model="filter_condition.tag_list"
                   @change="onCheckedTagChange"
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
                 allow-half/>
        <el-text>~</el-text>
        <el-rate v-model="filter_condition.show_max_score"
                 allow-half/>
      </el-form-item>

      <!-- filter name -->
      <el-form-item label="Name" v-if="filter_condition.show_name">
        <el-input v-model="filter_condition.name"
                  style="width: 200px; font-size: 24px; margin-right: 20px"
                  clearable/>
      </el-form-item>
    </el-form>
  </el-space>
</template>

<script lang="ts">
import ActorFilterData from "../data/ActorFilterData";
import ActorCategory from "../consts/ActorCategory";
import NewActorTag from "./NewActorTag.vue";
import {mapState} from "pinia";
import {ActorTagStore} from "../store/ActorTagStore";

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
      all_actor_category_list: ActorCategory.AllCategories,
      filter_history: [] as ActorFilterData[]
    }
  },

  computed: {
    ...mapState(ActorTagStore, {actor_tag_list: 'sorted_list'}),
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
    //
    checkAllCategory(val: boolean) {
      // console.log("all", val)
      this.filter_condition.checkAllCategory(val)
    },
    onCheckedCategoryChange(val: number[]) {
      // console.log("check", ...val)
      this.filter_condition.onCheckedCategoryChange(val)
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
  },

}
</script>

<style scoped>

</style>