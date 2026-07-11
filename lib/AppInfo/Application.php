<?php

declare(strict_types=1);

namespace OCA\LegacyHeader\AppInfo;

use OCP\AppFramework\App;
use OCP\AppFramework\Bootstrap\IBootContext;
use OCP\AppFramework\Bootstrap\IBootstrap;
use OCP\AppFramework\Bootstrap\IRegistrationContext;
use OCP\AppFramework\Http\Events\BeforeTemplateRenderedEvent;
use OCA\LegacyHeader\Listener\LoadHeaderAssets;

class Application extends App implements IBootstrap {
	public const APP_ID = 'legacy_header';

	public function __construct(array $urlParams = []) {
		parent::__construct(self::APP_ID, $urlParams);
	}

	public function register(IRegistrationContext $context): void {
		$context->registerEventListener(BeforeTemplateRenderedEvent::class, LoadHeaderAssets::class);
	}

	public function boot(IBootContext $context): void {
	}
}
