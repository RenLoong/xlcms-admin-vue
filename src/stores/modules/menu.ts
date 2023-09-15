import { useStorage } from '@/common/common';
export default () => {
    const storage = useStorage();
    const MENU = ref([]);
    const initMenu = () => {
        const data = storage.get('MENU');
        if (data) {
            MENU.value = data as any;
        }
    }
    const setMenu = (data: any) => {
        MENU.value = data;
        storage.set('MENU', data);
    }
    return {
        MENU,
        initMenu,
        setMenu
    };
}