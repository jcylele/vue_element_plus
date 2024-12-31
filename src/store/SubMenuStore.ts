import {defineStore} from "pinia";
import {MainMenu} from "../data/Enums";


export const SubMenuStore = defineStore('SubMenuStore', {
    state: () => ({
        sub_menu_map: new Map<MainMenu, string>
    }),
    getters: {},
    actions: {
        set(main_menu: MainMenu, sub_menu: string) {
            if (!this.sub_menu_map) {
                this.sub_menu_map = new Map<MainMenu, string>()
            }
            this.sub_menu_map.set(main_menu, sub_menu)
        },
        get(main_menu: MainMenu): string {
            if (!this.sub_menu_map) {
                return null
            }
            return this.sub_menu_map.get(main_menu)
        },
    },
})
