import { createApp, h, ref } from 'vue'
import { subscribe } from '@nextcloud/event-bus'
import { loadState } from '@nextcloud/initial-state'
import LegacyAppMenu from './LegacyAppMenu.vue'
import './legacy-header.scss'

const appState = loadState('core', 'apps', [])

function hideStockAppMenu() {
	// Core Vue replaces its original mount element with .app-menu. Do not rely
	// only on the initial HTML or on a CSS selector that can disappear with it.
	for (const stockMenu of document.querySelectorAll('#header .header-start > .app-menu')) {
		stockMenu.style.setProperty('display', 'none', 'important')
		stockMenu.setAttribute('aria-hidden', 'true')
	}
}

function keepStockAppMenuHidden() {
	const headerStart = document.querySelector('#header .header-start')
	if (!headerStart) {
		return
	}

	hideStockAppMenu()
	new MutationObserver(hideStockAppMenu).observe(headerStart, { childList: true, subtree: true })
}

function findMount() {
	const stockMenuMount = document.querySelector('#header-start__appmenu')
	if (!stockMenuMount || !stockMenuMount.parentElement) {
		return null
	}

	// Nextcloud owns #header-start__appmenu and mounts its Vue AppMenu into it.
	// Mounting inside that element lets core replace this app's DOM on startup.
	// Keep the core root intact and place the legacy menu beside it instead.
	let mount = document.querySelector('#legacy-header-appmenu-mount')
	if (!mount) {
		mount = document.createElement('nav')
		mount.id = 'legacy-header-appmenu-mount'
		mount.setAttribute('aria-label', 'Applications')
		stockMenuMount.insertAdjacentElement('afterend', mount)
	}
	return mount
}

function mountLegacyMenu() {
	keepStockAppMenuHidden()
	const mount = findMount()
	if (!mount || mount.dataset.legacyHeaderMounted === 'true') {
		return
	}

	const apps = ref(appState)
	const legacyMenu = createApp({
		setup: () => () => h(LegacyAppMenu, { apps: apps.value }),
	})
	const updateApps = ({ apps: refreshedApps = [] } = {}) => {
		apps.value = refreshedApps
	}

	legacyMenu.mount(mount)
	mount.dataset.legacyHeaderMounted = 'true'
	subscribe('nextcloud:app-menu.refresh', updateApps)
}

// Core's header application bootstraps after the layout has been parsed.  Run
// after that bootstrap so the separate sibling mount is never replaced.
if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', mountLegacyMenu, { once: true })
} else {
	queueMicrotask(mountLegacyMenu)
}
