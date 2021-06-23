/**
 * @copyright  (C) 2018 Open Source Matters, Inc. <https://www.joomla.org>
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 */

// Ajax call to get the update status of the installed extensions
(() => {
  'use strict';

  // Add a listener on content loaded to initiate the check
  document.addEventListener('DOMContentLoaded', () => {
    if (Joomla.getOptions('js-extensions-update')) {
      const options = Joomla.getOptions('js-extensions-update');

      const update = (type, text) => {
        const link = document.getElementById('plg_quickicon_extensionupdate');
        const linkSpans = [].slice.call(link.querySelectorAll('span.j-links-link'));
        if (link) {
          link.classList.add(type);
        }

        if (linkSpans.length) {
          linkSpans.forEach((span) => {
            span.innerHTML = Joomla.sanitizeHtml(text);
          });
        }
      };

      Joomla.request({
        url: options.ajaxUrl,
        method: 'GET',
        data: '',
        perform: true,
        onSuccess: (response) => {
          const updateInfoList = JSON.parse(response);

          if (Array.isArray(updateInfoList)) {
            if (updateInfoList.length === 0) {
              // No updates
              update('success', Joomla.Text._('PLG_QUICKICON_EXTENSIONUPDATE_UPTODATE'));
            } else {
              update('danger', Joomla.Text._('PLG_QUICKICON_EXTENSIONUPDATE_UPDATEFOUND').replace('%s', `<span class="badge text-dark bg-light">${updateInfoList.length}</span>`));
            }
          } else {
            // An error occurred
            update('danger', Joomla.Text._('PLG_QUICKICON_EXTENSIONUPDATE_ERROR'));
          }
        },
        onError: () => {
          // An error occurred
          update('danger', Joomla.Text._('PLG_QUICKICON_EXTENSIONUPDATE_ERROR'));
        },
      });
    }
  });
})();
