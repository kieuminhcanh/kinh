<script setup lang="ts">
import { computed, nextTick, onMounted, onBeforeUnmount, ref, watch } from "vue";
import { useData, useRoute, withBase } from "vitepress";

const route = useRoute();
const { page, theme, frontmatter } = useData();

type PagerItem = { text?: string; link: string } | undefined;

// Flatten sidebar config (matches VitePress internal sidebar resolution).
function flatten(items: unknown[]): Array<{ link: string; text?: string }> {
  const out: Array<{ link: string; text?: string }> = [];
  for (const it of items) {
    if (!it || typeof it !== "object") continue;
    const obj = it as Record<string, unknown>;
    if (typeof obj.link === "string") {
      out.push({ link: obj.link, text: typeof obj.text === "string" ? obj.text : undefined });
    }
    if (Array.isArray(obj.items)) out.push(...flatten(obj.items));
  }
  return out;
}

function sidebarFor(rel: string): unknown[] {
  const sidebar = (theme.value as { sidebar?: unknown }).sidebar;
  if (Array.isArray(sidebar)) return sidebar;
  if (sidebar && typeof sidebar === "object") {
    const map = sidebar as Record<string, unknown>;
    // Find longest matching prefix
    const path = "/" + rel;
    let best: unknown[] = [];
    let bestLen = -1;
    for (const key of Object.keys(map)) {
      if (path.startsWith(key) && key.length > bestLen) {
        const v = map[key];
        if (Array.isArray(v)) {
          best = v;
          bestLen = key.length;
        }
      }
    }
    return best;
  }
  return [];
}

const control = computed<{ prev: PagerItem; next: PagerItem }>(() => {
  const rel = page.value.relativePath.replace(/\.md$/, "").replace(/\/index$/, "/");
  const items = flatten(sidebarFor(page.value.relativePath));
  const idx = items.findIndex((l) => {
    const linkRel = l.link.replace(/^\//, "");
    return linkRel === rel || linkRel + "/" === rel || linkRel === rel + "/";
  });
  const fm = frontmatter.value as { prev?: unknown; next?: unknown };
  const hidePrev = fm.prev === false;
  const hideNext = fm.next === false;
  const prevItem = idx > 0 ? items[idx - 1] : undefined;
  const nextItem = idx >= 0 && idx < items.length - 1 ? items[idx + 1] : undefined;
  return {
    prev: hidePrev || !prevItem ? undefined : { text: prevItem.text, link: prevItem.link },
    next: hideNext || !nextItem ? undefined : { text: nextItem.text, link: nextItem.link },
  };
});
const rootEl = ref<HTMLElement | null>(null);

// Move the rendered pager from its mount point (slot `doc-before`, which
// renders BEFORE the markdown <Content/>) to sit right after the page's
// first <h1> inside `.vp-doc`. Done in DOM rather than via slot because
// VitePress has no slot between h1 and the rest of the content.
function reposition() {
  if (typeof document === "undefined") return;
  const node = rootEl.value;
  if (!node) return;
  const h1 = document.querySelector(".vp-doc h1");
  if (!h1 || !h1.parentNode) return;
  // Remove any previously moved pager nodes (orphans from prior route changes).
  // Vue's slot remount creates a new node; the old one stays detached inside
  // .vp-doc because Vue lost track of it after we manually re-parented.
  document.querySelectorAll(".vp-doc > .chapter-pager-top").forEach((el) => {
    if (el !== node) el.remove();
  });
  // Insert right after h1 (idempotent: re-insert if already there is fine).
  h1.parentNode.insertBefore(node, h1.nextSibling);
}

onMounted(() => {
  void nextTick(reposition);
});

// Re-position on chapter navigation (VitePress SPA route change).
const stop = watch(
  () => route.path,
  () => void nextTick(reposition),
);

onBeforeUnmount(() => {
  stop();
});
</script>

<template>
  <!-- Hidden until repositioned to avoid flash at top of <Content> -->
  <nav
    v-if="control.prev || control.next"
    ref="rootEl"
    class="chapter-pager-top print:hidden"
    aria-label="Chapter navigation"
  >
    <a
      v-if="control.prev"
      class="pager-link prev"
      :href="withBase(control.prev.link || '')"
      :aria-label="control.prev.text || 'Previous chapter'"
      :title="control.prev.text"
      >‹</a
    >
    <span v-else class="pager-spacer" aria-hidden="true" />
    <a
      v-if="control.next"
      class="pager-link next"
      :href="withBase(control.next.link || '')"
      :aria-label="control.next.text || 'Next chapter'"
      :title="control.next.text"
      >›</a
    >
    <span v-else class="pager-spacer" aria-hidden="true" />
  </nav>
</template>

<style scoped>
.chapter-pager-top {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin: 1.5rem 0 2rem;
}
.pager-link {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  min-height: 3.5rem;
  font-size: 3rem;
  line-height: 1;
  font-weight: 700;
  text-decoration: none;
  color: var(--vp-c-text-2);
  transition:
    border-color 0.2s,
    color 0.2s;
}
.pager-link:hover {
  border-color: var(--vp-c-brand-1);
  color: var(--vp-c-brand-1);
}
.pager-spacer {
  display: block;
}
</style>
