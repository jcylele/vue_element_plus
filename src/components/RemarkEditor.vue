<template>
  <el-space direction="vertical" :fill="true">
    <el-space direction="horizontal">
      <el-text style="font-size: 24px; color: hotpink;">
        Remarks
      </el-text>
      <svg-icon size="24px" name="add"
                @click="onAdd"/>
    </el-space>
    <el-space v-for="item in remark_items"
              direction="horizontal" alignment="stretch">
      <el-input :key="item.id"
                v-model="item.content"
                style="width: 500px;"/>
      <svg-icon size="30px" name="remove"
                @click="onClear(item.id)"/>
    </el-space>
    <el-space direction="horizontal" alignment="stretch">
      <el-button type="primary" @click="onSubmit">
        Save
      </el-button>
      <el-button type="warning" @click="onCancel">
        Cancel
      </el-button>
    </el-space>
  </el-space>
</template>

<script lang="ts">

interface RemarkItem {
  id: number,
  content: string,
}

export default {
  name: "RemarkEditor",
  props: {
    remark: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      remark_items: [] as RemarkItem[],
    }
  }
  ,
  methods: {
    onClear(id: number) {
      this.remark_items.splice(id, 1)
      for (let i = 0; i < this.remark_items.length; i++) {
        this.remark_items[i].id = i
      }
    },
    onAdd() {
      const new_id = this.remark_items.length
      this.remark_items.push({id: new_id, content: ""})
    },
    onSubmit() {
      if (this.remark_items.length == 0) {
        this.$emit("submit", "")
        return
      }
      const new_remark = this.remark_items.map(item => item.content).join("\n");
      this.$emit("submit", new_remark)
    },
    onCancel() {
      this.$emit("cancel")
    },
  },
  mounted() {
    this.remark_items = []
    if (this.remark != null && this.remark != "") {
      const list = this.remark.split("\n");
      for (let i = 0; i < list.length; i++) {
        this.remark_items.push({id: i, content: list[i]})
      }
    }
  }
}
</script>

<style scoped>

</style>