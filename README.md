# Nextcloud Restore Header

`legacy_header` is an AGPL-licensed compatibility app for **Nextcloud 34 only**.
It restores the Nextcloud 31-style horizontal application menu without replacing
the rest of the header.

The app reads the `core/apps` initial state, reacts to
`nextcloud:app-menu.refresh`, and leaves search, notifications, contacts, and
the account menu under Nextcloud's control.

## Responsive behaviour

- On displays up to 1500 px wide, applications are available through a compact
  **Apps** control. This prevents menu icons from colliding with Nextcloud's
  centred search control.
- Wider displays use the horizontal icon row.
- If the horizontal row cannot fit, excess applications move into **More**.
- The compact menu panel is viewport-bounded and scrollable, including on
  narrow mobile screens.

## Requirements

- Nextcloud Server 34.x.
- Administrator access to the Nextcloud host or container.
- A writable custom-app directory, normally `custom_apps`.

This app intentionally declares compatibility with major version 34 only. Do
not enable it on another major version without testing its header integration.

## Install a release archive

1. Download `nextcloud-restore-header-1.0.6.tar.gz` from the release artifact.
2. Back up the current Nextcloud configuration and any existing
   `legacy_header` app directory.
3. Extract the archive into the Nextcloud custom-app directory. The resulting
   path must be `<nextcloud>/custom_apps/legacy_header/appinfo/info.xml`:

   ```bash
   tar -xzf nextcloud-restore-header-1.0.6.tar.gz -C /var/www/html/custom_apps
   ```

4. Ensure the web-server user can read the files (and owns the directory when
   required by your deployment):

   ```bash
   chown -R www-data:www-data /var/www/html/custom_apps/legacy_header
   ```

5. From the Nextcloud installation directory, enable the app:

   ```bash
   sudo -u www-data php occ app:enable legacy_header
   ```

6. Sign in and refresh the page. Verify the header at a phone width, a tablet
   width, and a wide desktop width.

For a Docker deployment, run the equivalent commands inside the Nextcloud
container. `occ app:list --shipped false` and `occ app:enable` are the standard
administration commands documented by Nextcloud.

## Update or rollback

To update, disable the app, replace the `legacy_header` directory with the new
release, then enable it again:

```bash
sudo -u www-data php occ app:disable legacy_header
sudo -u www-data php occ app:enable legacy_header
```

To roll back, disable `legacy_header` and restore the backed-up app directory.
Removing or disabling this app returns Nextcloud to its stock application menu.

## Development

```bash
npm ci
npm run build
```

The distributable archive contains only the runtime app files (`appinfo`,
`css`, `js`, and `lib`) plus this README. It does not include development
dependencies or source maps.
