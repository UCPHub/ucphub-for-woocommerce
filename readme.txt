=== UCPhub for WooCommerce ===
Contributors: ucphub
Tags: woocommerce, ucp, ai, commerce, automation
Requires at least: 5.8
Tested up to: 6.9.4
Requires PHP: 7.4
Stable tag: 1.0.3
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Connect your WooCommerce store to UCPhub and let AI agents discover and purchase products on behalf of customers.

== Description ==

UCPhub for WooCommerce enables your store to participate in the Universal Commerce Protocol (UCP) ecosystem. AI agents and platforms can discover your products, create checkouts, and complete purchases automatically.

= Features =

* Serve a UCP discovery profile on your store's `/.well-known/ucp` endpoint
* Configure which UCP capabilities your store supports (checkout, orders, fulfillment, discounts)
* Manage payment handler integrations for AI-driven purchases
* Connect to UCPhub for centralized store management

= Requirements =

* WordPress 5.8 or later
* WooCommerce 5.0 or later (tested up to 10.6.1)
* PHP 7.4 or later

== Installation ==

1. Upload the `ucphub-for-woocommerce` folder to `/wp-content/plugins/`.
2. Activate the plugin through the "Plugins" menu in WordPress.
3. Go to the UCPhub settings page and connect your store using your API key and Store ID from the UCPhub dashboard.

== Frequently Asked Questions ==

= What is UCP? =

UCP (Universal Commerce Protocol) is a protocol that enables AI agents and platforms to discover products, create checkouts, and complete purchases on behalf of users. Learn more at [ucp.dev](https://ucp.dev).

= Do I need a UCPhub account? =

Yes. You need to create an account at [app.ucphub.ai](https://app.ucphub.ai) and set up your store to get an API key and Store ID.

== External services ==

This plugin connects to the UCPhub API to enable UCP protocol functionality for your WooCommerce store.

= UCPhub API (api.ucphub.ai) =

This plugin sends requests to UCPhub at `https://api.ucphub.ai` in the following situations:

* **On plugin activation:** The UCPhub API URL is stored as a setting.
* **When serving the UCP discovery profile:** The plugin fetches your store's UCP profile from UCPhub. This happens when any visitor or AI agent accesses `/.well-known/ucp` on your store.
* **When managing store settings:** API key, store ID, and store configuration are sent to UCPhub when you connect, disconnect, or update your store settings in the WordPress admin.
* **When completing onboarding setup:** Store URL, WooCommerce credentials, and selected capabilities are sent during the initial setup process.

Data sent includes: API key, store ID, store URL, WooCommerce REST API credentials (consumer key/secret), and store configuration settings.

This service is provided by UCPhub:

* Service website: [https://ucphub.ai](https://ucphub.ai)
* Terms and Conditions: [https://ucphub.ai/terms-and-conditions/](https://ucphub.ai/terms-and-conditions/)
* Privacy Policy: [https://ucphub.ai/privacy-policy/](https://ucphub.ai/privacy-policy/)

== Source Code ==

The full source code for this plugin, including the React admin dashboard and build tools, is available at:
[https://github.com/UCPHub/ucphub-for-woocommerce](https://github.com/UCPHub/ucphub-for-woocommerce)

== Screenshots ==

1. Connect your store with your API Key and Store ID from the UCPhub dashboard.
2. General tab showing connection status, organization, and store details.
3. Configure which UCP capabilities are available to AI agents.
4. Enable payment handlers that AI agents can use for orders.
5. Set up policy links included in your UCP profile.
6. Tools to verify your UCP profile and test backend connectivity.

== Changelog ==

= 1.0.3 =
* Declared compatibility with WooCommerce High-Performance Order Storage (HPOS).
* Added WooCommerce version compatibility headers.

= 1.0.2 =
* Smarter reconnect handling — API key rotation no longer requires full re-onboarding.
* Credentials are now validated against the backend before saving.
* Fixed onboarding flow being interrupted after credential validation.

= 1.0.1 =
* Fixed inline script for notice dismissal to use wp_enqueue_script and wp_add_inline_script per WordPress guidelines.

= 1.0.0 =
* Initial release.
