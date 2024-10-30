<template>
    <el-space direction="vertical" :fill="true">
        <el-text style="font-size: 24px;font-weight: bold; color: hotpink;">
            Remarks
        </el-text>
        <el-space direction="horizontal">
            <el-input v-model="remark"
                      class="remark-input"
                      type="textarea"
                      @change="onRemarkChange"/>
            <el-space direction="vertical" v-if="remark_changed">
                <el-button type="primary" style="width: 80px" @click="onSubmit">
                    Save
                </el-button>
                <el-button type="warning" style="width: 80px" @click="onCancel">
                    Cancel
                </el-button>
            </el-space>
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

export default {
    name: "RemarkEditor",
    props: {
        actor: ActorData,
    },
    data() {
        return {
            remark: "",
            remark_changed: false,
        }
    },
    methods: {
        onRemarkChange() {
            this.remark_changed = true
        },
        onSubmit() {
            this.$emit("submit", this.remark)
        },
        onCancel() {
            this.$emit("cancel")
        },
    },
    mounted() {
        this.remark = this.actor.remark
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