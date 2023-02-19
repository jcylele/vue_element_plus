<template>
  <div class="common-layout">
    <el-container>
      <el-aside width="200px">
        <el-menu
            class="el-menu-demo"
            mode="vertical"
            background-color="#545c64"
            text-color="#fff"
            active-text-color="#ffd04b"
            @select="onMenuItemSelect"
        >
          <el-menu-item index="/download">Download More</el-menu-item>
          <el-menu-item index="/actors">Show Actors</el-menu-item>
          <el-menu-item index="/actor_tags">Show Actor Tags</el-menu-item>
        </el-menu>

      </el-aside>
      <router-view></router-view>
    </el-container>
  </div>
</template>

<script lang="ts">
export default {
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

