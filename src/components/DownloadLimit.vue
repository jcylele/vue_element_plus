<template>
  <el-space direction="vertical" class="limit-form">
    <!-- Presets -->
    <el-space direction="horizontal" wrap>
      <el-radio-group v-model="cur_preset">
        <el-radio v-for="preset in preset_option_list"
                  :label="preset.value">
          {{ preset.label }}
        </el-radio>
      </el-radio-group>
    </el-space>

    <el-form :model="download_limit"
             label-width="200px" label-position="left">
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
        <el-input-number v-model="download_limit.post_count" :max="9999" :step="50"/>
      </el-form-item>
      <el-form-item label="Total File Size(MB)">
        <el-input-number v-model="download_limit.show_total_file_size" :max="10240" :step="512"/>
      </el-form-item>
      <el-form-item label="Single File Size(MB)">
        <el-input-number v-model="download_limit.show_file_size" :max="1024" :step="20"/>
      </el-form-item>
      <el-form-item label="File Types">
        <el-checkbox v-model="download_limit.allow_img" label="Images" size="large"/>
        <el-checkbox v-model="download_limit.allow_video" label="Videos" size="large"/>
      </el-form-item>
    </el-form>
  </el-space>
</template>

<script lang="ts">
import {DownloadLimitForm} from "../data/SimpleForms";
import {LimitPreset, PostFilter} from "../data/Enums";
import {Preset_Options} from "../data/Consts"

export default {
  name: "DownloadLimit",
  props: {
    download_limit: DownloadLimitForm
  },
  data() {
    return {
      cur_preset: LimitPreset.All,
      post_filter: PostFilter,
    }
  },
  computed: {
    preset_option_list() {
      return Preset_Options
    }
  },
  watch: {
    async cur_preset(new_val, old_val) {
      this.download_limit.resetDefaultValue(new_val)
    }
  },
}
</script>

<style scoped>

.limit-form {
  border: 1px solid;
  padding: 5px;
}

</style>