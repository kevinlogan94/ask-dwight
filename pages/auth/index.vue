<script setup lang="ts">
const router = useRouter();

onMounted(() => {
  router.push("/auth/login");
});
</script>
