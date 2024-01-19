<template>
  <el-space direction="vertical" border>
    <!-- Presets -->
    <el-space direction="horizontal">
      <el-radio-group v-model="cur_actor_category">
        <el-radio v-for="category in all_actor_category_list"
                  :label="category.value"
                  :key="category.value">
          {{ category.name }}
        </el-radio>
      </el-radio-group>
    </el-space>

    <el-form :model="download_limit"
             label-width="100px" label-position="left">
      <el-form-item label="Actor Count">
        <el-input-number v-model="download_limit.actor_count" :max="200" :step="5"/>
      </el-form-item>
      <el-form-item label="Post Filter">
        <el-radio-group v-model="download_limit.post_filter">
          <el-radio :label="post_filter.Normal">Normal</el-radio>
          <el-radio :label="post_filter.Old">Current</el-radio>
          <el-radio :label="post_filter.New">New</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="Post Count">
        <el-input-number v-model="download_limit.post_count" :max="9999" :step="25"/>
      </el-form-item>
      <el-form-item label="File Size(MB)">
        <el-input-number v-model="download_limit.file_size" :max="1024" :step="10"/>
      </el-form-item>
      <el-form-item label="File Types">
        <el-checkbox v-model="download_limit.allow_img" label="Images" size="large"/>
        <el-checkbox v-model="download_limit.allow_video" label="Videos" size="large"/>
      </el-form-item>
    </el-form>
  </el-space>
</template>

<script lang="ts">
import {DownloadLimitForm, PostFilter} from "../data/SimpleForms";
import ActorCategory from "../consts/ActorCategory";

export default {
  name: "DownloadLimit",
  props: {
    download_limit: DownloadLimitForm
  },
  data() {
    return {
      cur_actor_category: ActorCategory.Init.value,
      all_actor_category_list: ActorCategory.AllCategories,
      post_filter: PostFilter
    }
  },
  watch: {
    async cur_actor_category(new_val, old_val) {
      this.download_limit.resetDefaultValue(new_val)
    }
  },
}
</script>

<style scoped>

.limit-label {
  width: 160px;
  /*height: 40px;*/
  font-size: 16px;
  color: darkgreen;
}

</style>