<template>
  <el-space direction="vertical" :fill="true">
    <el-space direction="horizontal">
      <el-text style="font-size: 24px; color: hotpink;">
        Remarks
      </el-text>
      <svg-icon size="24px" name="add"
                @click="onAddRemark"/>
    </el-space>
    <el-space v-for="(line, index) in remark_items"
              direction="horizontal" alignment="center">
      <el-input v-model="line.data"
                style="width: 500px;"/>
      <svg-icon name="remove" size="24px"
                @click="onClear(index)"/>
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

interface RemarkLine {
  data: string
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
      remark_items: [] as RemarkLine[],
    }
  }
  ,
  methods: {
    onClear(index: number) {
      this.remark_items.splice(index, 1)
    },
    onAddRemark() {
      this.remark_items.push({data: ""})
    },
    onSubmit() {
      if (this.remark_items.length == 0) {
        this.$emit("submit", "")
        return
      }
      const new_remark = this.remark_items.map(line => line.data).join("\n");
      this.$emit("submit", new_remark)
    },
    onCancel() {
      this.$emit("cancel")
    },
  },
  mounted() {
    this.remark_items = []
    if (this.remark != null && this.remark != "") {
      let list = this.remark.split("\n")
      for (let i = 0; i < list.length; i++) {
        this.remark_items.push({data: list[i]})
      }
    }

  }
}
</script>

<style scoped>

</style>