let URLModule = globalThis.location.pathname.replace(/^\/|\/$/g, '');
const version = import.meta.env.VITE_APP_VERSION;
const version_name = import.meta.env.VITE_APP_VERSION_NAME;
export default {
    storagePrefix: URLModule ? URLModule.toUpperCase() : 'KFADMIN',
    storage: globalThis.localStorage,
    URLModule,
    version,
    version_name
} as ConfigInterface;

export const zipMimeType = [
    'application/x-zip-compressed',
    'application/zip',
    'application/x-zip-compresse',
    'application/octet-stream',
    'application/x-compress',
    'application/x-compressed',
    'multipart/x-zip',
    'application/x-rar-compressed',
    'application/x-rar',
    'application/x-tar',
    'application/x-gzip',
    'application/x-7z-compressed',
    'application/x-zip',
];
export const weekText = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
export const son_auth = [
    { action: 'Query', name: '查询' },
    { action: 'Delete', name: '删除' },
    { action: 'Add', name: '创建' },
    { action: 'Edit', name: '编辑' },
    { action: 'Restore', name: '恢复' },
    { action: 'SetState', name: '设置状态' },
    { action: 'Cache', name: '缓存' }
];

export const ads_seat_alias = [
    {
        alias: 'FULL-SCREEN',
        title: '一屏图片'
    },
    {
        alias: 'FULL-SCREEN-SWIPER',
        title: '一屏轮播'
    },
    {
        alias: 'HALF-SCREEN',
        title: '半屏图片'
    },
    {
        alias: 'HALF-SCREEN-SWIPER',
        title: '半屏轮播'
    },
    {
        alias: 'SWIPER',
        title: '轮播'
    },
    {
        alias: 'ROWS',
        title: '横向盒子'
    },
    {
        alias: 'DEFAULT',
        title: '自定义'
    },
];