<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
	apps: { type: Array, default: () => [] },
})

const menu = ref(null)
const visibleCount = ref(props.apps.length)
const overflowOpen = ref(false)
let resizeObserver

const normalizedApps = computed(() => props.apps
	.filter((app) => app && (app.href || app.url))
	.map((app) => ({
		id: app.id || app.name,
		name: app.name || app.id,
		href: app.href || app.url,
		icon: app.icon || null,
		active: Boolean(app.active),
	}))
)
const visibleApps = computed(() => normalizedApps.value.slice(0, visibleCount.value))
const overflowApps = computed(() => normalizedApps.value.slice(visibleCount.value))

async function recalculateOverflow() {
	// Measure the complete menu on every resize so items can return from More
	// when the header becomes wider again.
	visibleCount.value = normalizedApps.value.length
	await nextTick()
	if (!menu.value) return

	const items = [...menu.value.querySelectorAll('[data-legacy-menu-item]')]
	const available = menu.value.clientWidth
	if (!available || !items.length) return

	// Start with all items measured. If they do not fit, reserve the More control.
	const widths = items.map((item) => Math.ceil(item.getBoundingClientRect().width))
	const moreWidth = 52
	let used = 0
	let count = widths.length
	for (let index = 0; index < widths.length; index++) {
		if (used + widths[index] + (index < widths.length - 1 ? moreWidth : 0) > available) {
			count = index
			break
		}
		used += widths[index]
	}
	visibleCount.value = Math.max(0, count)
	if (!overflowApps.value.length) overflowOpen.value = false
}

function closeOverflow() {
	overflowOpen.value = false
}

watch(normalizedApps, () => {
	visibleCount.value = normalizedApps.value.length
	recalculateOverflow()
}, { deep: true })

onMounted(() => {
	recalculateOverflow()
	resizeObserver = new ResizeObserver(recalculateOverflow)
	resizeObserver.observe(menu.value)
	document.addEventListener('click', closeOverflow)
})

onBeforeUnmount(() => {
	resizeObserver?.disconnect()
	document.removeEventListener('click', closeOverflow)
})
</script>

<template>
	<nav ref="menu" class="legacy-header-app-menu" aria-label="Applications">
		<ul class="legacy-header-app-menu__list">
			<li v-for="app in visibleApps" :key="app.id" data-legacy-menu-item>
				<a :href="app.href" :class="{ active: app.active }" :title="app.name" :aria-label="app.name">
					<img v-if="app.icon" :src="app.icon" alt="" aria-hidden="true">
					<span v-else class="legacy-header-app-menu__label">{{ app.name }}</span>
				</a>
			</li>
		</ul>
		<div v-if="overflowApps.length" class="legacy-header-app-menu__more" @click.stop>
			<button type="button" aria-haspopup="menu" :aria-expanded="overflowOpen" @click="overflowOpen = !overflowOpen">More</button>
			<ul v-if="overflowOpen" role="menu">
				<li v-for="app in overflowApps" :key="app.id" role="none">
					<a :href="app.href" role="menuitem" :class="{ active: app.active }" @click="closeOverflow">
						<img v-if="app.icon" :src="app.icon" alt="" aria-hidden="true">
						<span>{{ app.name }}</span>
					</a>
				</li>
			</ul>
		</div>
	</nav>
</template>
