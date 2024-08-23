<template>
  <el-container>
    <el-aside width="140px">
      <el-menu
          mode="vertical"
          text-color="#000000"
          active-text-color="#a0a0fb"
          @select="onMenuItemSelect">
        <el-menu-item index="tag_relatives">Tag Relatives</el-menu-item>
        <el-menu-item index="tag_scores">Tag Scores</el-menu-item>
        <el-menu-item index="score_tags">Score Tags</el-menu-item>
      </el-menu>
    </el-aside>
    <el-main>
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<script lang="ts">

export default {
  name: "ECharts",
  components: [],
  data() {
    return {}
  },
  computed: {},
  methods: {
    onMenuItemSelect(key: string) {
      this.$router.push(`/echarts/${key}`)
    },
  },
}

</script>

<style scoped>
</style>