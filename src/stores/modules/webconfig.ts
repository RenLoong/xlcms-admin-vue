import { useStorage } from '@/common/common';
export default () => {
    const storage = useStorage();
    const WEBCONFIG = ref<WebConfigInterface>({
        siteinfo: {},
        public_api: {}
    });
    const initWebConfig = () => {
        const data = storage.get('WEBCONFIG');
        if (data) {
            WEBCONFIG.value = data as WebConfigInterface;
        }
    }
    const setWebConfig = (data: WebConfigInterface) => {
        WEBCONFIG.value = data;
        storage.set('WEBCONFIG', data);
    }
    return {
        WEBCONFIG,
        initWebConfig,
        setWebConfig
    };
}