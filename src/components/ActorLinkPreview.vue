<template>
    <el-space direction="vertical" style="gap: 2px 0" fill>
        <el-text class="desc-text">
            click above tags to add, below tags to remove
        </el-text>
        <el-space v-for="actor in actors" class="row">
            <el-text class="col-name">{{ actor.actor_name }}</el-text>
            <el-rate class="col-score"
                     v-model="actor.show_score"
                     :colors="Star_Colors"
                     void-color="#777777"
                     :max="6"
                     disabled
                     allow-half/>
            <el-space class="col-tags" direction="horizontal" size="small" wrap>
                <el-tag v-for="tag_id in actor.tag_ids"
                        :key="tag_id"
                        :style="actorTagStore.getStyle(tag_id)"
                        effect="plain"
                        @click="addTag(tag_id)"
                        round>
                    {{ actorTagStore.getName(tag_id) }}
                </el-tag>
            </el-space>
        </el-space>
        <el-divider direction="horizontal" style="margin: 5px 0"/>
        <el-space class="result-row row" direction="horizontal">
            <el-text class="col-name">
                Edit Link Result
            </el-text>
            <el-space class="col-result" direction="vertical" size="small" fill>
                <el-rate v-model="show_score"
                         :colors="Star_Colors"
                         void-color="#777777"
                         :max="6"
                         allow-half/>
                <el-space direction="horizontal" size="small" wrap>
                    <el-tag v-for="tag_id in tag_list"
                            :key="tag_id"
                            :style="actorTagStore.getStyle(tag_id)"
                            effect="plain"
                            @close="removeTag(tag_id)"
                            closable round>
                        {{ actorTagStore.getName(tag_id) }}
                    </el-tag>
                </el-space>
                <el-input v-model="remark" placeholder="Remark" type="textarea" autosize/>
            </el-space>
        </el-space>
        <div class="center-row" style="margin-top: 10px;">
            <el-button type="primary" @click="onSubmit">
                Submit
            </el-button>
            <el-button type="warning" @click="onCancel">
                Cancel
            </el-button>
        </div>
    </el-space>
</template>

<script setup lang="ts">
// imports
import ActorData from "../data/ActorData";
import {computed, onMounted, Ref, ref, watch} from "vue";
import {ActorTagStore} from "../store/ActorTagStore";
import {Star_Colors} from "../data/Consts";
// emits
const emit = defineEmits(['submit', 'cancel'])
// stores/routers
const actorTagStore = ActorTagStore()
// props/models

const props = defineProps({
    actors: Array<ActorData>
})
// variables
const tag_list: Ref<number[]> = ref([])
const score = ref(0)
const remark = ref("")
// computed
const show_score = computed({
    // getter
    get() {
        return score.value / 2
    },
    // setter
    set(val) {
        score.value = val * 2
    }
})
// watch
watch(() => props.actors, async (new_actors) => {
    initLinkResult()
})

// methods
function removeTag(tag_id: number) {
    tag_list.value.splice(tag_list.value.indexOf(tag_id), 1)
}

function addTag(tag_id: number, sort: boolean = true) {
    if (tag_list.value.includes(tag_id)) return
    tag_list.value.push(tag_id)
    if (sort) {
        tag_list.value.sort(actorTagStore.compareTagId)
    }
}

function onSubmit() {
    emit("submit", score.value, remark.value, tag_list.value)
}

function onCancel() {
    emit("cancel")
}

/**
 * set score to max of actors
 * tag_list unions distinct tag ids of actors
 */
function initLinkResult() {
    score.value = 0
    remark.value = ""
    tag_list.value = []

    for (const actor of props.actors) {
        if (actor.score > score.value) {
            score.value = actor.score
        }
        for (const tag_id of actor.tag_ids) {
            addTag(tag_id, false)
        }
        if (actor.remark !== "" && remark.value != actor.remark) {
            if (remark.value === "") remark.value = actor.remark
            else remark.value += `\n${actor.remark}`
        }
    }
    // sort tags at the end
    tag_list.value.sort(actorTagStore.compareTagId)

    console.log(`init score: ${score.value}, tag_list: ${tag_list.value}`)
}

// lifecycle
onMounted(() => {
    initLinkResult()
})
</script>
<style scoped>
.desc-text {
    font-style: italic;
}

.row {
    padding: 5px;
}

.result-row {
    background-color: var(--el-card-bg-color);
}

.col-name {
    font-weight: bold;
    font-size: var(--el-font-size-large);
    width: 170px;
}

.col-score {
    width: 170px;
}

.col-tags {
    width: 330px;
}

.col-result {
    width: 500px; /* 330px + 170px */
}
</style>