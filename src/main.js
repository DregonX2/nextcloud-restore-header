import { createApp, h, ref } from 'vue'
import { subscribe } from '@nextcloud/event-bus'
import { loadState } from '@nextcloud/initial-state'
import LegacyAppMenu from './LegacyAppMenu.vue'
import './legacy-header.scss'

const appState = loadState('core', 'apps', [])

function findMount() {
	const logo = document.querySelector('#nextcloud')
	if (!logo || !logo.parentElement) {
		return null
	}

	let mount = document.querySelector('#header-start__appmenu')
	if (!mount) {
		mount = document.createElement('div')
		mount.id = 'header-start__appmenu'
		logo.insertAdjacentElement('afterend', mount)
	}
	return mount
}

const mount = findMount()
if (mount) {
	const apps = ref(appState)
	const legacyMenu = createApp({
		setup: () => () => h(LegacyAppMenu, { apps: apps.value }),
	})
	const updateApps = ({ apps: refreshedApps = [] } = {}) => {
		apps.value = refreshedApps
	}

	legacyMenu.mount(mount)
	subscribe('nextcloud:app-menu.refresh', updateApps)
}
