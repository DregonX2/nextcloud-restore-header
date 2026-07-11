<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

const props = defineProps({
	apps: { type: Array, default: () => [] },
})

const menu = ref(null)
const visibleCount = ref(props.apps.length)
const overflowOpen = ref(false)
let resizeObserver
let compactMediaQuery
let headerEnd
let searchControl

const isCompact = ref(false)

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
	// Compact headers use one control for the complete app list. Measuring the
	// hidden inline links at this size would otherwise produce stale results.
	if (isCompact.value) {
		visibleCount.value = 0
		return
	}

	// Measure the complete menu on every resize so items can return from More
	// when the header becomes wider again.
	visibleCount.value = normalizedApps.value.length
	await nextTick()
	if (!menu.value) return

	const items = [...menu.value.querySelectorAll('[data-legacy-menu-item]')]
	const menuBounds = menu.value.getBoundingClientRect()
	const headerEndBounds = headerEnd?.getBoundingClientRect()
	searchControl = document.querySelector('#header .unified-search-input__button, #header .unified-search-input')
	const searchBounds = searchControl?.getBoundingClientRect()
	if (searchControl && resizeObserver) resizeObserver.observe(searchControl)
	const isRtl = getComputedStyle(menu.value).direction === 'rtl'
	// Nextcloud's search control can visually extend beyond .header-end. Its
	// rendered edge, rather than the container's edge, is the actual no-go line
	// for menu links at intermediate viewport widths.
	const boundaries = [headerEndBounds, searchBounds].filter((bounds) => bounds && bounds.width > 0)
	const boundary = boundaries.length
		? (isRtl
			? Math.max(...boundaries.map((bounds) => bounds.right))
			: Math.min(...boundaries.map((bounds) => bounds.left)))
		: (isRtl ? menuBounds.left : menuBounds.right)
	const usableWidth = isRtl ? menuBounds.right - boundary : boundary - menuBounds.left
	const available = Math.max(0, Math.min(menu.value.clientWidth, usableWidth - 8))
	if (!available) {
		visibleCount.value = 0
		return
	}
	if (!items.length) return

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

function updateCompactMode(event) {
	isCompact.value = event.matches
	if (isCompact.value) {
		visibleCount.value = 0
	} else {
		recalculateOverflow()
	}
}

watch(normalizedApps, () => {
	visibleCount.value = normalizedApps.value.length
	recalculateOverflow()
}, { deep: true })

onMounted(() => {
	// Nextcloud's centred search field occupies header space well beyond its
	// flex container. Keep the full icon row for genuinely wide headers only;
	// tablet and standard laptop widths use the compact control instead.
	compactMediaQuery = window.matchMedia('(max-width: 1500px)')
	updateCompactMode(compactMediaQuery)
	compactMediaQuery.addEventListener('change', updateCompactMode)
	headerEnd = document.querySelector('#header .header-end')
	resizeObserver = new ResizeObserver(recalculateOverflow)
	resizeObserver.observe(menu.value)
	if (headerEnd) resizeObserver.observe(headerEnd)
	recalculateOverflow()
	document.addEventListener('click', closeOverflow)
	window.addEventListener('resize', recalculateOverflow)
})

onBeforeUnmount(() => {
	resizeObserver?.disconnect()
	compactMediaQuery?.removeEventListener('change', updateCompactMode)
	document.removeEventListener('click', closeOverflow)
	window.removeEventListener('resize', recalculateOverflow)
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
		<div v-if="isCompact || overflowApps.length" class="legacy-header-app-menu__more" @click.stop>
			<button type="button" aria-haspopup="menu" :aria-expanded="overflowOpen" @click="overflowOpen = !overflowOpen">
				{{ isCompact ? 'Apps' : 'More' }}
			</button>
			<ul v-if="overflowOpen" role="menu">
				<li v-for="app in (isCompact ? normalizedApps : overflowApps)" :key="app.id" role="none">
					<a :href="app.href" role="menuitem" :class="{ active: app.active }" @click="closeOverflow">
						<img v-if="app.icon" :src="app.icon" alt="" aria-hidden="true">
						<span>{{ app.name }}</span>
					</a>
				</li>
			</ul>
		</div>
	</nav>
</template>
