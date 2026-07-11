# Nextcloud Restore Header

An AGPL-licensed compatibility app for **Nextcloud 34 only** that restores the
Nextcloud 31-style horizontal application menu without replacing the header.

It reads `core/apps` initial state, reacts to `nextcloud:app-menu.refresh`,
keeps the stock AppMenu mounted but hidden, and calculates a responsive More
overflow menu. Search, notifications, contacts, and the account menu are left
untouched.

## Install

1. Build the release assets with `npm ci && npm run build`.
2. Copy this directory to `<nextcloud>/custom_apps/legacy_header`.
3. Enable it with `php occ app:enable legacy_header`.

Review this app before upgrading Nextcloud: it intentionally declares support
only for major version 34 because its frontend navigation API and CSS anchors
are an integration boundary.

## Purpose

## Setup

## Development

## Notes
