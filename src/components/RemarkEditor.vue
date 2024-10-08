<template>
    <el-space direction="vertical" :fill="true">
        <el-space direction="horizontal">
            <el-text style="font-size: 24px;font-weight: bold; color: hotpink;">
                Remarks
            </el-text>
            <el-button type="success" @click="onAddRemark">
                Add
            </el-button>
            <el-button type="primary" v-if="remark_changed" @click="onSubmit" style="margin-left: 40px">
                Save
            </el-button>
            <el-button type="warning" v-if="remark_changed" @click="onCancel">
                Cancel
            </el-button>
        </el-space>
        <el-space v-for="(line, index) in remark_items"
                  direction="horizontal" alignment="center">
            <el-input v-model="line.data"
                      class="remark-input"
                      type="textarea"
                      @change="onItemChange"/>
            <el-button type="danger" @click="onClear(index)">
                Remove
            </el-button>
        </el-space>
        <el-divider style="margin: 5px"/>
        <el-space v-for="post in actor.commented_posts"
                  direction="horizontal" alignment="center">
            <el-text style="font-size: 24px; color: royalblue;">
                {{ post.post_id }}: {{ post.comment }}
            </el-text>
        </el-space>
    </el-space>
</template>

<script lang="ts">

import ActorData from "../data/ActorData";

interface RemarkLine {
    data: string
}

export default {
    name: "RemarkEditor",
    props: {
        actor: ActorData,
    },
    data() {
        return {
            remark_items: [] as RemarkLine[],
            remark_changed: false,
        }
    },
    methods: {
        onItemChange() {
            this.remark_changed = true
        },
        onClear(index: number) {
            this.remark_items.splice(index, 1)
            this.remark_changed = true
        },
        onAddRemark() {
            this.remark_items.push({data: ""})
            this.remark_changed = true
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
        this.remark_items = this.actor.remark_list.map(line => ({data: line}))
    }
}
</script>

<style scoped>
.remark-input {
    width: 480px;
    font-size: 24px;
    --el-input-text-color: hotpink;
}

.remark-input .el-input__inner {
    font-size: 24px;
    color: hotpink;
}
</style>