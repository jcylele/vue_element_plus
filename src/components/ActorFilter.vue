<template>
  <el-form :model="filter_condition"
           label-width="100px" label-position="left">
    <!-- filter category -->
    <el-form-item label="Category">
      <el-checkbox-group v-model="filter_condition.category_list"
                         @change="onCheckedCategoryChange"
                         size="large">
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
    <el-form-item label="Tags">
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
      <NewActorTag/>
    </el-form-item>

    <!-- filter name -->
    <el-form-item label="Name">
      <el-input v-model="filter_condition.name"
                @change="onFilterNameChange"
                style="width: 200px; font-size: 24px; margin-right: 20px"
                clearable/>
      <el-switch
          v-model="filter_condition.star"
          class="mb-2"
          active-text="star"
          border/>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onFilterChange">Search</el-button>
      <el-button @click="onFilterCancel">Reset</el-button>
      <el-button v-if="history.length > 0" type="success" @click="toPreviousFilter">Previous</el-button>
    </el-form-item>
  </el-form>
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
      history: [] as ActorFilterData[]
    }
  },

  computed: {
    ...mapState(ActorTagStore, {actor_tag_list: 'sorted_list'}),
  },

  methods: {
    //name input changed
    onFilterNameChange() {
      this.filter_condition.onFilterNameChange()
    },
    //
    async onFilterChange() {
      this.history.push(this.filter_condition.clone())
      await this.$emit('change')
    },
    async onFilterCancel() {
      this.filter_condition.reset()
      // await this.$emit('change')
    },
    async toPreviousFilter() {
      if (this.history.length > 0) {
        this.filter_condition.copy(this.history.pop())
        await this.$emit('change')
      }
    },
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
  },

}
</script>

<style scoped>

</style>