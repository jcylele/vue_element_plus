<template>
  <el-container>
    <el-space direction="vertical" size="large" :fill="true">
      <el-space v-for="tag_group in editing_tags.slice().reverse()"
                style="border: 1px solid ; border-radius: 4px; padding: 2px"
                direction="horizontal" :wrap="true" :size="3" alignment="stretch">

        <el-checkbox-button v-for="tag_info in tag_group"
                            v-model="tag_info.selected">
          {{ tag_info.tag.tag_name }}

        </el-checkbox-button>

      </el-space>
      <!-- buttons -->
      <el-space direction="horizontal" alignment="center">
        <el-button type="primary" @click="onSubmit">
          Save
        </el-button>
        <el-button type="warning" @click="onCancel">
          Cancel
        </el-button>
      </el-space>

    </el-space>

  </el-container>
</template>

<script lang="ts">
import ActorTagData from "../data/ActorTagData.js";

interface TagInfo {
  tag: ActorTagData,
  selected: boolean,
}

export default {
  name: "ActorTagChooser",
  props: {
    editing_tags: {
      type: Array as () => TagInfo[][],
      required: true,
    },
  },
  data() {
    return {}
  },
  methods: {
    onSubmit() {
      this.$emit("submit")
    },
    onCancel() {
      this.$emit("cancel")
    },
  },
}
</script>

<style scoped>

</style>