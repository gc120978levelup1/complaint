<script setup lang="ts">
import type { HTMLAttributes } from 'vue';

defineOptions({
    inheritAttrs: false,
});

type Props = {
    className?: HTMLAttributes['class'];
};

defineProps<Props>();
</script>

<template>
    <div class=" rounded-md overflow-hidden">
        <img src="/favicon.jpg" alt="">
    </div>
</template>
