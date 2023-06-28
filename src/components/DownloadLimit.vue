<template>
  <el-space direction="vertical" border>
    <el-space direction="horizontal">
      <el-radio-group v-model="cur_actor_category">
        <el-radio v-for="category in all_actor_category_list"
                  :label="category.value"
                  :key="category.value">
          {{ category.name }}
        </el-radio>
      </el-radio-group>
    </el-space>
    <el-space direction="horizontal">
              <span class="limit-label">
                New Actor Count
              </span>
      <el-input-number v-model="download_limit.actor_count" :max="200" :step="5"/>
    </el-space>
    <el-space direction="horizontal">
              <span class="limit-label">
                Post Count
              </span>
      <el-input-number v-model="download_limit.post_count" :max="9999" :step="25"/>
    </el-space>
    <el-space direction="horizontal">
              <span class="limit-label">
                File Size Limit(MB)
              </span>
      <el-input-number v-model="download_limit.file_size" :max="1024" :step="10"/>
    </el-space>
  </el-space>
</template>

<script lang="ts">
import {DownloadLimitForm} from "../data/SimpleForms";
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