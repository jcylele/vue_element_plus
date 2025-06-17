<template>
    <el-space direction="vertical" size="small" fill>
        <el-space direction="horizontal" size="small">
            <el-text class="tag-left">
                No Tag
            </el-text>
            <el-checkbox v-model="tag_filter.show_no_tag"
                         @change="onAnyChange"
                         border>
                (check this also reset tags)
            </el-checkbox>
        </el-space>
        <el-space v-for="(tag_list, index) in tag_filter.tag_arr" :key="index" direction="horizontal" size="small">
            <el-text v-if="index < tag_filter.titles.length" class="tag-left">
                {{ tag_filter.titles[index] }}
            </el-text>
            <div v-else class="center-row tag-left">
                <svg-icon size="24px" name="remove" @click="removeLine(index)"/>
            </div>
            <el-select v-model="tag_filter.tag_arr[index]" @change="onAnyChange" style="width: 180px;"
                       multiple filterable clearable :reserve-keyword="false">
                <el-option v-for="actor_tag in actorTagStore.sorted_list" :key="actor_tag.tag_id"
                           :label="actor_tag.tag_name" :value="actor_tag.tag_id"/>
                <template #tag>
                    <el-tag v-if="tag_list.length > 0" effect="plain" type="success">
                        +{{ tag_list.length }}
                    </el-tag>
                </template>
            </el-select>
            <el-tag v-for="tag_id in tag_list" :key="tag_id"
                    :style="actorTagStore.getStyle(tag_id)"
                    effect="plain"
                    @close="removeTag(tag_id, index)"
                    closable>
                {{ actorTagStore.getName(tag_id) }}
            </el-tag>
        </el-space>
        <el-space v-if="!tag_filter.show_no_tag" direction="horizontal" size="small">
            <div class="center-row tag-left">
                <svg-icon size="24px" name="add" @click="tag_filter.addLine()"/>
            </div>
        </el-space>
    </el-space>
</template>

<script setup lang="ts">
// imports
import {TagFilter} from "../data/ActorFilterData";
import {ActorTagStore} from "../store/ActorTagStore";
// emits
const emit = defineEmits(['change'])
// stores/routers
const actorTagStore = ActorTagStore()
// props/models
const props = defineProps({
    tag_filter: TagFilter
})
// variables
// computed
// watch
// methods
function onAnyChange() {
    emit('change')
}

function removeLine(index: number) {
    const has = props.tag_filter.removeLine(index)
    if (has) {
        onAnyChange()
    }
}

function removeTag(tag_id, index) {
    props.tag_filter.removeTag(tag_id, index)
    onAnyChange()
}

// lifecycle
</script>

<style scoped>

.tag-left {
    width: 90px;
}
</style>