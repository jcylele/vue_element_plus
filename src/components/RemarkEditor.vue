<template>
    <el-space direction="vertical" fill style="width: 100%">

        <el-space direction="vertical" fill>
            <el-space direction="horizontal" alignment="stretch">
                <el-text style="font-size: 24px;font-weight: bold; color: hotpink;">
                    Remarks
                </el-text>
                <el-button type="primary" style="margin-left: 20px" @click="onSubmit">
                    Save
                </el-button>
                <el-button type="warning" @click="onCancel">
                    Cancel
                </el-button>
            </el-space>
            <el-input v-model="remark"
                      class="remark-input"
                      type="textarea"
                      @change="onRemarkChange"
                      autosize/>
        </el-space>
        <el-divider style="margin: 5px"/>
        <el-space v-if="actor.commented_posts.length == 0" direction="horizontal">
            <el-text style="font-size: 22px; color: royalblue;">
                No Commented Post
            </el-text>
        </el-space>
        <el-space v-else v-for="post in actor.commented_posts"
                  direction="horizontal" alignment="center">
            <el-text style="font-size: 22px; color: royalblue;">
                {{ post.post_id }}: {{ post.comment }}
            </el-text>
        </el-space>
        <el-space direction="horizontal">
            <el-button type="primary" @click="toPosts" plain>
                Edit Posts
            </el-button>
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
    emits: ["submit", "cancel", "posts"],
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
        toPosts() {
            this.$emit("posts")
        }
    },
    mounted() {
        this.remark = this.actor.remark
    }
}
</script>

<style scoped>
.remark-input {
    font-size: 24px;
    --el-input-text-color: hotpink;
}

.remark-input .el-input__inner {
    font-size: 24px;
    color: hotpink;
}
</style>