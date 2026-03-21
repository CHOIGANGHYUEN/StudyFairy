<template>
  <main>
    <h1>문서 요약기</h1>

    <section>
      <h3>1단계: 구글 계정 연결</h3>
      <GoogleLogin :callback="handleLoginSuccess" />
    </section>
  </main>
</template>

<script setup>
const handleLoginSuccess = (response) => {
  // 로그인이 성공하면 구글에서 인증 토큰(Credential)을 던져줍니다.
  console.log("🔥 로그인 성공! 구글이 준 증명서:", response);

  // TODO: 나중에 이 토큰을 Pinia 스토어에 저장하고 드라이브 접근에 사용할 겁니다.
};
</script>

<style scoped>
main {
  padding: 2rem;
}
section {
  margin-top: 2rem;
}
</style>
