<?php

declare(strict_types=1);

namespace OCA\LegacyHeader\AppInfo;

use OCP\AppFramework\App;

class Application extends App {
	public const APP_ID = 'legacy_header';

	public function __construct() {
		parent::__construct(self::APP_ID);
	}
}
