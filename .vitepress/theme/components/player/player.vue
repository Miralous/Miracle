<script setup lang="ts">
// prepared
import { globalConfig } from "#config";
interface PlayerProps {
  id: string;
}
const props = withDefaults(defineProps<PlayerProps>(), {
  id: "",
});
// vars
const id = props.id;
const api = globalConfig.netease.metingApi;
</script>

<template>
  <div class="player" style="font-family: var(--vp-font-family-mono)">
    <br />
    <h1>DEBUG</h1>
    This is the debug page. We are waiting for our collaborator Sptanmok to
    finish this function powered by Mrachritmo.<br />
    <br />
    <h1>DATA</h1>
    { id: {{ id }}, api: {{ api }} }
  </div>
</template>
