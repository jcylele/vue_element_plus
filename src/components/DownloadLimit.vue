<template>
    <el-space direction="vertical" class="limit-form">
        <!-- Presets -->
        <el-text style="font-style: italic">
            Select Post Filter And Res Type First
        </el-text>

        <el-form :model="download_limit"
                 label-width="200px" label-position="left">

            <el-form-item label="Post Filter">
                <el-radio-group v-model="download_limit.post_filter"
                                @change="onPostFilterChange">
                    <el-radio v-for="pf in post_filter_list"
                              :value="pf.value">
                        {{ pf.label }}
                    </el-radio>
                </el-radio-group>
            </el-form-item>

            <el-form-item label="Res Type">
                <el-radio-group v-model="download_limit.res_type"
                                @change="onResTypeChange">
                    <el-radio v-for="pf in res_type_list"
                              :value="pf.value">
                        {{ pf.label }}
                    </el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="Actor Count">
                <el-input-number v-model="download_limit.actor_count" :min="0" :max="1000" :step="50"/>
            </el-form-item>
            <el-form-item label="Post Count">
                <el-input-number v-model="download_limit.post_count" :min="0" :max="1000" :step="50"/>
            </el-form-item>
            <el-form-item label="Res Count">
                <el-input-number v-model="download_limit.file_count" :min="0" :max="200" :step="20"/>
            </el-form-item>
            <el-form-item label="Total Res Size(MB)">
                <el-input-number v-model="download_limit.show_total_file_size" :min="0" :max="10240" :step="512"/>
            </el-form-item>
            <el-form-item label="Single Res Size(MB)">
                <el-input-number v-model="download_limit.show_single_file_size" :min="0" :max="1024" :step="20"/>
            </el-form-item>
        </el-form>
    </el-space>
</template>

<script lang="ts">
import {DownloadLimitForm} from "../data/DownloadForms";
import {Post_Filter_Options, Res_Type_Options} from "../data/Consts"
import downJson from "../assets/down.json"

export default {
    name: "DownloadLimit",
    props: {
        download_limit: DownloadLimitForm
    },
    data() {
        return {
            down_json_obj: downJson
        }
    },
    computed: {

        post_filter_list() {
            return Post_Filter_Options
        },
        res_type_list() {
            return Res_Type_Options
        }
    },
    methods: {
        onPostFilterChange() {
            this.refreshPreset()
        },
        onResTypeChange() {
            this.refreshPreset()
        },
        refreshPreset() {
            const preset = this.down_json_obj.find(preset =>
                preset.res_type == this.download_limit.res_type
                && preset.post_filter == this.download_limit.post_filter
            )
            if (preset == undefined) return

            console.log(`change to ${preset.name}`)
            this.download_limit.setPresetValue(preset)
        }
    }
}
</script>

<style scoped>

.limit-form {
    border: 1px solid;
    padding: 5px;
}

</style>