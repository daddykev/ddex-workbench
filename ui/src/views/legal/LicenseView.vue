<!-- src/views/legal/LicenseView.vue -->
<template>
  <div class="container section pt-xl"> <!-- Added pt-xl class -->
    <div class="content-wrapper">
      <h1 class="text-3xl font-semibold mb-lg">MIT License</h1>
      <div class="license-content">
        <pre class="license-text">{{ licenseText }}</pre>
      </div>
      <div class="mt-xl">
        <a 
          href="https://github.com/daddykev/ddex-workbench/blob/main/LICENSE" 
          target="_blank" 
          rel="noopener"
          class="btn btn-secondary"
        >
          View on GitHub
        </a>
      </div>
    </div>
  </div>
</template>

<script setup>
// You could either hardcode the MIT license text or fetch it
const licenseText = `MIT License

Copyright (c) 2025 Kevin Moo

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`
</script>

<style scoped>
.content-wrapper {
  max-width: 800px;
  margin: 0 auto;
}

.license-text {
  background-color: var(--color-bg-secondary);
  padding: var(--space-lg);
  border-radius: var(--radius-md);
  border: 1px solid var(--color-border);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  line-height: var(--leading-relaxed);
  white-space: pre-wrap;
  word-wrap: break-word;
}
</style>