<?php

declare(strict_types=1);

use OCP\Util;

// Keep this bootstrap deliberately small: it runs only for authenticated web requests.
Util::addScript('legacy_header', 'legacy_header-legacy-header');
