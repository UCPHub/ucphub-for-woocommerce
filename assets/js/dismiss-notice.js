/* global jQuery */
(function ($) {
  $(document).on("click", "#ucphub-debug-notice .notice-dismiss", () => {
    $.post(window.ajaxurl, {
      action: "ucphub_dismiss_debug_notice",
      _wpnonce: window.ucphubDismissNotice.nonce,
    });
  });
})(jQuery);
