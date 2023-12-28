<template>
  <div class="common-layout">
    <el-container>
      <el-aside width="200px">
        <el-menu
            mode="vertical"
            background-color="#545c64"
            text-color="#fff"
            active-text-color="#ffd04b"
            @select="onMenuItemSelect">
          <el-sub-menu index="1">
            <template #title>
              <svg-icon size="20px" name="friend"/>
              <span>Actors</span>
            </template>
            <el-menu-item index="/actors">Actors</el-menu-item>
<!--            <el-menu-item index="/actor_links">Actor Links</el-menu-item>-->
            <el-menu-item index="/actor_tags">Actor Tags</el-menu-item>
          </el-sub-menu>
          <el-sub-menu index="2">
            <template  #title>
              <svg-icon size="20px" name="download"/>
              <span>Download</span>
            </template>
            <el-menu-item index="/download">Download</el-menu-item>
            <el-menu-item index="/tasks">Tasks</el-menu-item>
          </el-sub-menu>
        </el-menu>

      </el-aside>
      <router-view></router-view>
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

