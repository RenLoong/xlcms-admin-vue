
export { };
declare global {
    interface ResponseCodeInterface {
        readonly [propName: string]: number
    }
    type StorageInterface = string | string[] | object | object[] | number | number[] | null
    interface UserInfoInterface {
        nickname?: string,
        token?: string,
        permissions?: string[],
        [propName: string]: StorageInterface
    }
    interface OptionsInterface {
        label: string,
        value: any,
        [propName: string]: any
    }
    interface ConfigInterface {
        storagePrefix: string,
        URLModule: string,
        storage: Storage,
        version: number
        version_name: string
    }
    interface ResponseInterface {
        code?: number | string,
        data?: StorageInterface,
        msg?: string,
        [propName: string]: any
    }
    interface VcodeInterface {
        url?: string,
        time?: number,
        method?: string,
        message?: boolean
    }
    interface WebConfigInterface {
        siteinfo: any,
        public_api: any
    }
    interface UserHeaderEventMapInterface {
        key: string,
        title: string,
        props?: object,
        handle?: () => void,
        [propName: string]: any
    }
    interface BuyInfoInterface {
        id: number,
        project?: string,
        title?: string,
        origin_price?: string | number,
        price?: string | number,
        type: string,
        order_no?: string,
        num?: number,
        extra: OptionsInterface[],
        options?: OptionsInterface[],
        pay_type?: string,
        [propName: string]: any
    }
    interface PluginThumbInterface {
        id?: number,
        plugin_id?: number,
        path: string,
        url: string,
    }
    interface AppsCateInterface {
        id: number,
        title: string,
        icon: string | null,
        children?: AppsCateInterface[],
        [propName: string]: any
    }
    interface AppsPromotionInterface {
        appid: number,
        title: string,
        money: number,
        origin_money: number,
        start_time: string,
        end_time: string,
        state: number
    }
    interface AppsItemInterface {
        name: string,
        title: string,
        content: string,
        logo: string,
        install_method: string,
        discount?: number,
        money: number,
        dev: DevInterface,
        version_find?: AppsVersionInterface,
        thumb: PluginThumbInterface[],
        cateTop?: any,
        promotion?: AppsPromotionInterface,
        [propName: string]: any
    }
    interface AppsVersionInterface {
        id: number,
        version: number,
        saas_version: number,
        saas_version_name: number,
        version_name: string,
        update_at: string,
    }
    interface VersionDescInterface {
        create_at: string,
        version_name: string,
        version: number,
        remarks: string
    }
    interface PluginThumbInterface {
        id?: number,
        plugin_id?: number,
        path: string,
        url: string,
    }
    interface issuesInterface {
        id: number,
        type_text: string;
        title: string;
        style_type: "success" | "warning" | "error" | "info";
        description: string;
    }
}
import { SlateDescendant, SlateElement, SlateText } from '@wangeditor/editor'

declare module '@wangeditor/editor' {
    // 扩展 Text
    interface SlateText {
        text: string
    }

    // 扩展 Element
    interface SlateElement {
        type: string
        children: SlateDescendant[]
    }
}