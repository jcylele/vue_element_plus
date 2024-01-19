<template>
  <div class="common-layout">
    <el-container>
      <el-header>
        <el-menu
            mode="horizontal"
            background-color="#545c64"
            text-color="#fff"
            active-text-color="#ffd04b"
            @select="onMenuItemSelect">

<!--          <svg-icon size="20px" name="friend"/>-->
          <el-menu-item index="/actors">Actors</el-menu-item>
          <el-menu-item index="/actor_tags">Actor Tags</el-menu-item>

<!--          <svg-icon size="20px" name="download"/>-->
          <el-menu-item index="/download">Download</el-menu-item>
          <el-menu-item index="/tasks">Tasks</el-menu-item>
        </el-menu>
      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </div>
</template>

<script lang="ts">
export default {
  components: {},

  data() {
    return {}
  },
  methods: {
    onMenuItemSelect(key: string) {
      this.$router.push(key)
    }
  },
}
</script>

<style scoped>

</style>

