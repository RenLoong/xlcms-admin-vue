<script setup lang="ts">
import { $http } from "@/common/common";
import router from "@/routers";
import { useMenuStore, useRefs, useUserStore, useWebConfigStore } from "@/stores";
import { FormInstance, FormRules, ElMessage } from "element-plus";
const { setUserInfo } = useUserStore()
const { setMenu } = useMenuStore()
const webConfigStore = useWebConfigStore();
const { WEBCONFIG } = useRefs(webConfigStore);
const loginFormRef = ref<FormInstance>();
const form = reactive({
	username: '',
	password: '',
	captcha: ''
})
const rules = reactive<FormRules>({
	username: [
		{ required: true, message: '请输入账号', trigger: 'blur' }
	],
	password: [
		{ required: true, message: '请输入密码', trigger: 'blur' }
	],
	scode: [
		{ required: true, message: '请输入图形验证码', trigger: 'blur' }
	],
});
const apiUrl = {
	login: 'login/login'
};
const url = ref(apiUrl.login);
const login = () => {
	loginFormRef.value?.validate((valid: boolean) => {
		if (valid) {
			$http.post(url.value, form).then((res: any) => {
				if (res.code === $http.ResponseCode.SUCCESS) {
					setMenu(res.data.menu);
					setUserInfo(res.data.user).then(() => {
						router.push('/index');
					}).catch((err: any) => {
						console.log(err);
					})
					ElMessage.success(res.message);
				} else {
					ElMessage.info(res.message);
				}
			})
		} else {
			ElMessage.error('请将表单填写完整');
		}
	})
}
const captchaChange = () => {
	form.captcha = '';
}
const loginBgImage = ref('');
let loginBgImageEr: NodeJS.Timer;
const getLoginBg = () => {
	const xhr = new XMLHttpRequest();
	xhr.open('GET', 'https://picsum.photos/1920/1080?random', true);
	xhr.responseType = 'blob';
	xhr.onload = function () {
		if (this.status === 200) {
			const blob = this.response;
			loginBgImage.value = URL.createObjectURL(blob);
		}
	}
	xhr.send();
}
onMounted(() => {
	getLoginBg();
	loginBgImageEr = setInterval(() => {
		getLoginBg();
	}, 30000)
})
onUnmounted(() => {
	clearInterval(loginBgImageEr);
})
</script>

<template>
	<div class="login" :style="{ backgroundImage: `url(${loginBgImage})` }">
		<div class="login-mask">
			<div class="flex flex-1 flex-center">
				<el-form ref="loginFormRef" :model="form" :rules="rules" class="login-form bg-filter py-10"
					label-position="top" hide-required-asterisk :show-message="false" @submit.prevent="login" size="large">
					<div class="text-center p-5">
						<div class="flex flex-center pb-4">
							<div class="h6 font-weight-600 nav-item active">{{ WEBCONFIG.siteinfo.title }} 管理员登录</div>
						</div>
					</div>
					<div class="flex-1 py-5 w-60 mx-auto flex flex-center flex-column">
						<el-form-item label="用户名" class="w-100" prop="username">
							<el-input v-model="form.username" placeholder="手机号/用户名/邮箱"></el-input>
						</el-form-item>
						<el-form-item label="密码" class="w-100" prop="password">
							<el-input v-model="form.password" type="password" placeholder="密码"></el-input>
						</el-form-item>
						<el-form-item label="图形验证码" class="w-100" prop="captcha">
							<el-input v-model="form.captcha" placeholder="图形验证码">
								<template #append>
									<captcha @change="captchaChange"></captcha>
								</template>
							</el-input>
						</el-form-item>
					</div>
					<div class="pt-4 pb-10 flex flex-center">
						<button class="login-button">
							<Right class="svgIcon font-weight-bold" />
						</button>
					</div>
				</el-form>
			</div>
		</div>
	</div>
</template>

<style lang="scss">
@import "@/pages/login/login.css";

.login {
	.login-form {
		.nav-item::after {
			content: '';
			margin-top: 10px;
			display: block;
			width: 100%;
			height: 4px;
			border-radius: 2px;
			background-color: var(--el-text-color-primary);
			transform: scaleX(0);
			transition: transform 0.3s;
		}

		.nav-item.active::after {
			transform: scaleX(1);
		}
	}
}
</style>
