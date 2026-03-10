=== UCPHub for WooCommerce ===
Contributors: ucphub
Tags: woocommerce, ucp, ai, commerce, automation
Requires at least: 5.8
Tested up to: 6.9
Requires PHP: 7.4
Stable tag: 1.0.0
License: GPL-2.0-or-later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Connect your WooCommerce store to UCPHub and let AI agents discover and purchase products on behalf of customers.

== Description ==

UCPHub for WooCommerce enables your store to participate in the Universal Commerce Protocol (UCP) ecosystem. AI agents and platforms can discover your products, create checkouts, and complete purchases automatically.

= Features =

* Serve a UCP discovery profile on your store's `/.well-known/ucp` endpoint
* Configure which UCP capabilities your store supports (checkout, orders, fulfillment, discounts)
* Manage payment handler integrations for AI-driven purchases
* Connect to UCPHub for centralized store management

= Requirements =

* WordPress 5.8 or later
* WooCommerce 5.0 or later
* PHP 7.4 or later

== Installation ==

1. Upload the `ucphub-for-woocommerce` folder to `/wp-content/plugins/`.
2. Activate the plugin through the "Plugins" menu in WordPress.
3. Go to the UCPHub settings page and connect your store using your API key and Store ID from the UCPHub dashboard.

== Frequently Asked Questions ==

= What is UCP? =

UCP (Universal Commerce Protocol) is a protocol that enables AI agents and platforms to discover products, create checkouts, and complete purchases on behalf of users. Learn more at [ucp.dev](https://ucp.dev).

= Do I need a UCPHub account? =

Yes. You need to create an account at [app.ucphub.ai](https://app.ucphub.ai) and set up your store to get an API key and Store ID.

== External services ==

This plugin connects to the UCPHub API to enable UCP protocol functionality for your WooCommerce store.

= UCPHub API (api.ucphub.ai) =

This plugin sends requests to UCPHub at `https://api.ucphub.ai` in the following situations:

* **On plugin activation:** The UCPHub API URL is stored as a setting.
* **When serving the UCP discovery profile:** The plugin fetches your store's UCP profile from UCPHub. This happens when any visitor or AI agent accesses `/.well-known/ucp` on your store.
* **When managing store settings:** API key, store ID, and store configuration are sent to UCPHub when you connect, disconnect, or update your store settings in the WordPress admin.
* **When completing onboarding setup:** Store URL, WooCommerce credentials, and selected capabilities are sent during the initial setup process.

Data sent includes: API key, store ID, store URL, WooCommerce REST API credentials (consumer key/secret), and store configuration settings.

This service is provided by UCPHub:

* Service website: [https://ucphub.ai](https://ucphub.ai)
* Terms and Conditions: [https://ucphub.ai/terms-and-conditions/](https://ucphub.ai/terms-and-conditions/)
* Privacy Policy: [https://ucphub.ai/privacy-policy/](https://ucphub.ai/privacy-policy/)

== Source Code ==

The full source code for this plugin, including the React admin dashboard and build tools, is available at:
[https://github.com/UCPHub/ucphub-for-woocommerce](https://github.com/UCPHub/ucphub-for-woocommerce)

== Changelog ==

= 1.0.0 =
* Initial release.
