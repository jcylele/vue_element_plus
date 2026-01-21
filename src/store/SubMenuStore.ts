import { ref } from "vue";
import { defineStore } from "pinia";
import { MainMenu } from "../data/Enums";

export const SubMenuStore = defineStore('SubMenuStore', () => {
	const sub_menu_map = ref(new Map<MainMenu, string>())

	function set(main_menu: MainMenu, sub_menu: string) {
		sub_menu_map.value.set(main_menu, sub_menu)
	}

	function get(main_menu: MainMenu): string {
		return sub_menu_map.value.get(main_menu) || ''
	}

	return { set, get }
})
