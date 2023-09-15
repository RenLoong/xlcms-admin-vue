import { ElNotification } from "element-plus";
import config from "./config";
import axios, { AxiosResponse } from "axios";
import { useUserStore } from "@/stores";
import router from "@/routers";
export const useStorage = () => {
    /**
     * 设置储存数据
     * @param key 键
     * @param data 值
     * @param expire 过期时间（秒）
     * @returns Promise
     */
    const set = (key: string, data: StorageInterface, expire?: number): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            const obj = {
                expire: 0,
                data: data,
            }
            if (expire !== undefined) {
                obj.expire = Date.now() + expire * 1000
            }
            config.storage.setItem(getKey(key), JSON.stringify(obj));
            if (get(key) === null) {
                reject();
            } else {
                resolve(true);
            }
        })
    }
    /**
     * 获取储存数据
     * @param key 键
     * @returns StorageInterface
     */
    const get = (key: string): StorageInterface => {
        const data = config.storage.getItem(getKey(key));

        if (data === null) {
            return null;
        }
        const ret = JSON.parse(data);

        if (ret?.expire > 0 && ret?.expire < Date.now()) {
            return null;
        }
        return ret?.data;
    }
    /**
     * 删除储存数据
     * @param key 键
     * @returns Promise
     */
    const remove = (key: string): Promise<boolean> => {
        return new Promise((resolve, reject) => {
            config.storage.removeItem(getKey(key));
            if (get(key) === null) {
                resolve(true);
            } else {
                reject();
            }
        })
    }
    /**
     * 获取数据并删除
     * @param key 键
     * @returns StorageInterface
     */
    const getOnce = (key: string): StorageInterface => {
        const data = get(key);
        remove(key);
        return data;
    }
    /**
     * 获取真实存储键名
     * @param key 键
     * @returns string
     */
    const getKey = (key: string): string => {
        return `${config.storagePrefix}.${key}`;
    }
    return { set, get, remove, getOnce, getKey };
}

let baseURL = '//' + globalThis.location.host + '/'
if (import.meta.env.VITE_REQUEST_BASE_URL) {
    baseURL = import.meta.env.VITE_REQUEST_BASE_URL
}
if (baseURL.endsWith("//")) {
    baseURL = baseURL.replace(/\/\/$/, "/");
}
if (import.meta.env.VITE_REQUEST_BASE_MODULE) {
    baseURL = baseURL + import.meta.env.VITE_REQUEST_BASE_MODULE
} else {
    baseURL = baseURL + config.URLModule
}
axios.interceptors.request.use((_config) => {
    const { hasLogin, getToken } = useUserStore();
    if (hasLogin()) {
        _config.headers.set('Authorization', getToken());
    }
    if (import.meta.env.DEV) {
        _config.headers.set('Yc-devmode', 'true');
    }
    _config.baseURL = baseURL;
    return _config;
}, (error) => {
    return Promise.reject(error);
});
axios.interceptors.response.use((response: AxiosResponse) => {
    const { clearUserInfo } = useUserStore();
    if (response?.data !== undefined) {
        if (response.data.code === $http.ResponseCode.DELETE_LOGIN) {
            clearUserInfo();
            ElNotification({
                title: '登录失效',
                message: response.data.message || '登录失效，请重新登录',
                showClose: false,
                type: 'error',
            })
            return router.push('/login');
        }
        return response.data;
    }
}, (error) => {
    ElNotification({
        title: '网络请求错误',
        message: error.message,
        showClose: false,
        type: 'error',
    })
    return Promise.reject(error);
});
const getUrl = (url: string) => {
    if (url.startsWith("http")) {
        return url;
    }
    return baseURL + url;
}
export const $http = {
    ResponseCode: {
        SUCCESS: 200,
        NEED_LOGIN: 600,
        DELETE_LOGIN: 601,
        PAY_SUCCESS: 9000
    },
    baseURL,
    get: axios.get,
    post: axios.post,
    getUrl,
    axios
}
const eventOn = (event: string, callback: Function) => {
    globalThis.addEventListener(event, (e: any) => {
        callback(e.detail)
    })
}
const eventRemove = (event: string, callback: Function) => {
    globalThis.removeEventListener(event, (e: any) => {
        callback(e.detail)
    })
}
const eventEmit = (event: string, data?: any) => {
    globalThis.dispatchEvent(new CustomEvent(event, { detail: data }))
}
export const $eventBus = {
    on: eventOn,
    emit: eventEmit,
    remove: eventRemove
}