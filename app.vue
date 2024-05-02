<script setup lang="ts">
import { version } from "@/package.json";
import JsonEditorVue from "json-editor-vue";
import "vanilla-jsoneditor/themes/jse-theme-dark.css";
import { Base64 } from "js-base64";
import CryptoJS from "crypto-js";
import { consola } from "consola";

const colorMode = useColorMode();
const colorModeButtonIcon = computed(() => {
  if (colorMode.preference === "system") return "i-heroicons-computer-desktop";
  if (colorMode.preference === "light") return "i-heroicons-sun";
  return "i-heroicons-moon";
});
const handleToggleColorMode = () => {
  if (colorMode.preference === "system") {
    colorMode.preference = "light";
    return;
  }
  if (colorMode.preference === "light") {
    colorMode.preference = "dark";
    return;
  }
  colorMode.preference = "system";
};

const { userAgent } = useDevice();

const encrypted = ref("");
const decrypted = ref();
const baseKey = computed(() => Base64.encode(userAgent));
const decryptKey = computed(() =>
  baseKey.value.length === 16
    ? baseKey.value
    : baseKey.value.slice(0, 16).padEnd(16, "0")
);

const handleDecrypt = () => {
  try {
    const params = ["content"];
    consola.info("encrypted", encrypted.value);
    const parsed = JSON.parse(encrypted.value);
    consola.info("parsed", parsed);
    params.forEach((param) => {
      let data = CryptoJS.enc.Base64.stringify(
        CryptoJS.enc.Hex.parse(parsed[param])
      );
      let iv = CryptoJS.enc.Utf8.parse(decryptKey.value);
      let decrypted = CryptoJS.AES.decrypt(data, iv, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.ZeroPadding,
      });
      parsed[param] = decrypted.toString(CryptoJS.enc.Utf8);
    });
    consola.info("typeof parsed.content", typeof parsed.content);
    consola.info("parsed.content", parsed.content);
    const lastIndex = parsed.content.lastIndexOf("}");
    parsed.content = JSON.parse(parsed.content.slice(0, lastIndex + 1));
    consola.info("updated parsed.content", parsed.content);
    decrypted.value = parsed;
  } catch (error) {
    window.alert("❌ Something went wrong! Please check console.");
    consola.error(error);
  }
};
</script>

<template>
  <UContainer class="container mx-auto">
    <header
      class="py-8 flex justify-between items-center sticky z-50 bg-[rgb(var(--ui-background))] top-0"
    >
      <div>
        <h1 class="text-4xl">JVS-UI Decryptor</h1>
        <p>v{{ version }}</p>
      </div>
      <UButton
        color="gray"
        variant="ghost"
        :icon="colorModeButtonIcon"
        @click="handleToggleColorMode"
      ></UButton>
    </header>
    <section>
      <label for="encrypted">Encrypted Text indicating a object:</label>
      <UTextarea id="encrypted" v-model="encrypted" :rows="8" padded />
      <UButton
        block
        class="my-2"
        icon="i-heroicons-lock-open"
        @click="handleDecrypt"
      >
        Decrypt!
      </UButton>
    </section>
    <section class="mt-8">
      <JsonEditorVue
        v-model="decrypted"
        readOnly
        :class="{ 'jse-theme-dark': colorMode.value === 'dark' }"
      ></JsonEditorVue>
    </section>
  </UContainer>
</template>
