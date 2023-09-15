import { StoreGeneric, defineStore, storeToRefs } from 'pinia'
import UserStore from "./modules/user";
export const useUserStore = defineStore('user', UserStore)

import WebConfigStore from "./modules/webconfig";
export const useWebConfigStore = defineStore('webconfig', WebConfigStore)

import MenuStore from "./modules/menu";
export const useMenuStore = defineStore('menu', MenuStore)

export const useRefs = (store: StoreGeneric) => {
    return storeToRefs(store);
}