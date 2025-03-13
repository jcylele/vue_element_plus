<template>
    <el-space direction="vertical" style="width: 100%;" fill>
        <el-space v-for="cond in cond_list" direction="horizontal"
                  :class="cond.in_use ? 'cond_enabled' : 'cond_disabled'">
            <el-checkbox v-model="cond.in_use" size="default" border/>
            <div v-if="cond.is_score" class="cond_row">
                <el-text>{{ cond.score_prefix }}</el-text>
                <el-rate v-model="cond.score_param"
                         :disabled="!cond.in_use"
                         :colors="star_colors"
                         void-color="#777777"
                         :max="6"
                         size="large"
                         allow-half/>
            </div>
            <div v-else-if="cond.is_switch" class="cond_row">
                <el-switch v-model="cond.bool_param"
                           :disabled="!cond.in_use"
                           width="50px"
                           :active-text="cond.true_text"
                           :inactive-text="cond.false_text"/>
            </div>
        </el-space>
        <!-- submit/cancel -->
        <el-space direction="horizontal" style="justify-content: center">
            <el-button type="primary" @click="onSubmit">Submit</el-button>
            <el-button type="warning" @click="onCancel">Cancel</el-button>
        </el-space>
    </el-space>
</template>

<script setup lang="ts">
// imports
import {computed, onMounted, ref, watch} from "vue";
import ActorGroupData from "../data/ActorGroupData";
import ActorGroupCond from "../data/ActorGroupCond";
import {GroupCondType} from "../data/Enums";
import {Star_Colors} from "../data/Consts";
// emits
const emit = defineEmits(['submit', 'cancel'])
// stores/routers
// props/models


const props = defineProps({
    group: ActorGroupData
})
// variables
const cond_list = ref([
    new ActorGroupCond(GroupCondType.MinScore),
    new ActorGroupCond(GroupCondType.MaxScore),
    new ActorGroupCond(GroupCondType.HasAnyTag),
    new ActorGroupCond(GroupCondType.Linked),
])
// computed
const star_colors = computed(() => Star_Colors)
// watch
watch(() => props.group, async (new_group) => {
    console.log(`GroupCondEditor watch group: ${new_group == null ? "null" : new_group.group_name}`)
    refresh()
})

// methods
function refresh() {
    // reset conditions
    for (const cond of cond_list.value) {
        cond.in_use = false
        cond.cond_param = 0
    }
    // set conditions
    if (props.group == null) return
    for (const cond of props.group.cond_list) {
        const c = cond_list.value[cond.cond_type]
        c.in_use = true
        c.cond_param = cond.cond_param
    }
}

function onSubmit() {
    const used_cond_list = cond_list.value.filter(cond => cond.in_use)
        .map(cond => new ActorGroupCond(cond.cond_type, cond.cond_param))
    emit('submit', used_cond_list)
}

//new /new2  HasAnyTag = false Linked = false
//nice / nicer HasAnyTag = true Linked = false
//good HasAnyTag = true
//loved HasAnyTag = true MinScore >= 3.5
//dislike HasAnyTag = true MinScore <= 3
//enough HasAnyTag = true MinScore >= 3.5
// recall HasAnyTag = true Linked = true

function onCancel() {
    emit('cancel')
}

// lifecycle
onMounted(() => {
    refresh()
})
</script>

<style scoped>

.cond_row {
    display: flex;
    flex-direction: row;
    align-items: center;
}

.cond_enabled {
    background-color: var(--me-odd-bg-color);
}

.cond_disabled {
    background-color: var(--el-bg-color);
}

</style>