<template>
  <main>
    <h1>문서 요약기</h1>

    <section>
      <h3>1단계: 구글 계정 연결</h3>
      <button @click="handleLogin">구글 계정으로 로그인</button>
    </section>
  </main>
</template>

<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';

const router = useRouter();
const authStore = useAuthStore();
let tokenClient;

onMounted(() => {
  tokenClient = google.accounts.oauth2.initTokenClient({
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    scope: 'https://www.googleapis.com/auth/drive.readonly https://www.googleapis.com/auth/documents',
    callback: (tokenResponse) => {
      if (tokenResponse && tokenResponse.access_token) {
        console.log('🔥 로그인 성공! 액세스 토큰:', tokenResponse.access_token);
        authStore.setAccessToken(tokenResponse.access_token);
        router.push('/summary');
      }
    },
  });
});

const handleLogin = () => {
  tokenClient.requestAccessToken();
};
</script>
