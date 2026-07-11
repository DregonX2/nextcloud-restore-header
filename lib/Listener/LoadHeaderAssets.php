<?php

declare(strict_types=1);

namespace OCA\LegacyHeader\Listener;

use OCA\LegacyHeader\AppInfo\Application;
use OCP\AppFramework\Http\Events\BeforeTemplateRenderedEvent;
use OCP\AppFramework\Http\TemplateResponse;
use OCP\EventDispatcher\Event;
use OCP\EventDispatcher\IEventListener;
use OCP\Util;

/** @template-implements IEventListener<BeforeTemplateRenderedEvent> */
class LoadHeaderAssets implements IEventListener {
	public function handle(Event $event): void {
		if (!$event instanceof BeforeTemplateRenderedEvent) {
			return;
		}

		// Do not load on the public or sign-in templates.
		if ($event->getResponse()->getRenderAs() !== TemplateResponse::RENDER_AS_USER) {
			return;
		}

		Util::addScript(Application::APP_ID, 'legacy_header-legacy-header');
		Util::addStyle(Application::APP_ID, 'legacy_header-legacy-header');
	}
}
