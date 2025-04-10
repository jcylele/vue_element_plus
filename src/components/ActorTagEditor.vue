<template>
    <div class="actor_tag">
        <el-space direction="vertical" border>
            <!-- Tag Name -->
            <el-text v-if="!tag_edit_info.is_editing" class="tag-title">{{ tag_edit_info.tag.tag_name }}</el-text>
            <el-input v-if="tag_edit_info.is_editing" v-model="tag_edit_info.tag.tag_name"/>
            <!-- used count -->
            <el-text>count: {{ tag_edit_info.tag.used_count }}</el-text>
            <!-- avg score -->
            <el-text class="tag-score" :style="{'color': tag_edit_info.tag.score_color}">
                score: {{ tag_edit_info.tag.avg_score.toFixed(2) }}
            </el-text>
            <!-- not in editing -->
            <el-space v-if="!tag_edit_info.is_editing" direction="horizontal" alignment="center">
                <svg-icon size="24px" name="edit"
                          @click="startEdit"/>
            </el-space>
            <!-- in editing -->
            <el-space v-if="tag_edit_info.is_editing"
                      size="large" direction="horizontal" alignment="center">
                <svg-icon size="24px" name="check"
                          @click="onSave"/>
                <svg-icon size="24px" name="refresh"
                          @click="onReset"/>
                <svg-icon size="24px" name="remove"
                          @click="onDelete"/>
            </el-space>

        </el-space>
    </div>
</template>

<script lang="ts">
import {mapActions} from "pinia";
import {ActorTagStore} from "../store/ActorTagStore";
import {delActorTag, updateTagName, getActorTag} from "../ctrls/ActorTagCtrl";
import {TagEditInfo} from "../data/WebData";

export default {
    name: "ActorTagEditor",
    props: {
        tag_edit_info: TagEditInfo
    },
    emits: ['delete'],
    methods: {
        ...mapActions(ActorTagStore, {
            removeActorTag: 'remove',
            updateActorTag: 'update'
        }),
        startEdit() {
            this.tag_edit_info.is_editing = true
        },
        stopEdit() {
            this.tag_edit_info.is_editing = false
        },
        async onSave() {
            const [ok, _] = await updateTagName(this.tag_edit_info.tag)
            if (ok) {
                this.stopEdit()
            }
        },
        async onReset() {
            const [ok, origin_tag] = await getActorTag(this.tag_edit_info.tag.tag_id)
            if (ok) {
                this.tag_edit_info.tag = origin_tag
                this.updateActorTag(origin_tag)
                this.stopEdit()
            }
        },
        async onDelete() {
            const tag_id = this.tag_edit_info.tag.tag_id
            const [ok, ret] = await delActorTag(tag_id)
            if (ok) {
                this.removeActorTag(tag_id)
                this.$emit('delete', tag_id)
            }
        },
    },
    async mounted() {
    }
}
</script>

<style scoped>
.actor_tag {
    background-color: var(--el-card-bg-color);
    padding: 10px;
    margin: 5px;
}

.tag-title {
    font-weight: bold;
}

.tag-score {
    background: linear-gradient(to bottom, #1A1A1A, #2C3E50);
    padding: 0 5px;
}
</style>