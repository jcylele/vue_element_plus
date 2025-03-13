<template>
    <el-space direction="vertical" class="limit-form">
        <!-- Presets -->
        <el-space direction="horizontal" wrap>
            <el-radio-group v-model="cur_preset">
                <el-radio v-for="preset in preset_option_list"
                          :value="preset">
                    {{ preset }}
                </el-radio>
            </el-radio-group>
        </el-space>

        <el-form :model="download_limit"
                 label-width="200px" label-position="left">
            <el-form-item label="Actor Count">
                <el-input-number v-model="download_limit.actor_count" :min="0" :max="1000" :step="50"/>
            </el-form-item>
            <el-form-item label="Post Filter">
                <el-radio-group v-model="download_limit.post_filter">
                    <el-radio v-for="pf in post_filter_list"
                              :value="pf.value">
                        {{ pf.label }}
                    </el-radio>
                </el-radio-group>
            </el-form-item>
            <el-form-item label="Post Count">
                <el-input-number v-model="download_limit.post_count" :min="0" :max="1000" :step="50"/>
            </el-form-item>
            <el-form-item label="Total File Size(MB)">
                <el-input-number v-model="download_limit.show_total_file_size" :min="0" :max="10240" :step="512"/>
            </el-form-item>
            <el-form-item label="Single File Size(MB)">
                <el-input-number v-model="download_limit.show_file_size" :min="0" :max="1024" :step="20"/>
            </el-form-item>
            <el-form-item label="File Types">
                <el-checkbox v-model="download_limit.allow_img" label="Images" size="large"/>
                <el-checkbox v-model="download_limit.allow_video" label="Videos" size="large"/>
            </el-form-item>
        </el-form>
    </el-space>
</template>

<script lang="ts">
import {DownloadLimitForm} from "../data/SimpleForms";
import {Post_Filter_Options} from "../data/Consts"
import downJson from "../assets/down.json"

export default {
    name: "DownloadLimit",
    props: {
        download_limit: DownloadLimitForm
    },
    data() {
        return {
            cur_preset: "",
            down_json_obj: downJson
        }
    },
    computed: {
        preset_option_list() {
            // return Preset_Options
            return this.down_json_obj.presets.map(preset => preset.name)
        },

        post_filter_list() {
            return Post_Filter_Options
        }
    },
    watch: {
        async cur_preset(new_val, old_val) {
            const default_preset = this.down_json_obj.default
            const preset = this.down_json_obj.presets.find(preset => preset.name == new_val)
            this.download_limit.setPresetValue(preset, default_preset)
        }
    },
}
</script>

<style scoped>

.limit-form {
    border: 1px solid;
    padding: 5px;
}

</style>