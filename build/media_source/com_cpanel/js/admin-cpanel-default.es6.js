/**
 * @copyright  (C) 2019 Open Source Matters, Inc. <https://www.joomla.org>
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 */

/**
 * Debounce
 * https://gist.github.com/nmsdvid/8807205
 *
 * @param { function } callback  The callback function to be executed
 * @param { int }  time      The time to wait before firing the callback
 * @param { int }  interval  The interval
 */
// eslint-disable-next-line max-len, no-param-reassign, no-return-assign
const debounce = (callback, time = 250, interval) => (...args) => clearTimeout(interval, interval = setTimeout(callback, time, ...args));

((window, document, Joomla) => {
  Joomla.unpublishModule = (element) => {
    // Get variables
    const baseUrl = 'index.php?option=com_modules&task=modules.unpublish&format=json';
    const id = element.getAttribute('data-module-id');

    Joomla.request({
      url: `${baseUrl}&cid=${id}`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      onSuccess: () => {
        const wrapper = element.closest('.module-wrapper');
        wrapper.parentNode.removeChild(wrapper);

        Joomla.renderMessages({
          message: [Joomla.Text._('COM_CPANEL_UNPUBLISH_MODULE_SUCCESS')],
        });
      },
      onError: () => {
        Joomla.renderMessages({
          error: [Joomla.Text._('COM_CPANEL_UNPUBLISH_MODULE_ERROR')],
        });
      },
    });
  };

  const onBoot = () => {
    const cpanelModules = document.getElementById('content');
    if (cpanelModules) {
      const links = [].slice.call(cpanelModules.querySelectorAll('.unpublish-module'));
      links.forEach((link) => {
        link.addEventListener('click', ({ target }) => Joomla.unpublishModule(target));
      });
    }

    // Cleanup
    document.removeEventListener('DOMContentLoaded', onBoot);
  };

  // Initialise
  document.addEventListener('DOMContentLoaded', onBoot);

  // Masonry layout for cpanel cards
  const MasonryLayout = {
    $gridBox: null,

    // Calculate "grid-row-end" property
    resizeGridItem($cell, rowHeight, rowGap) {
      const $content = $cell.querySelector('.card');
      if ($content) {
        const contentHeight = $content.getBoundingClientRect().height + rowGap;
        const rowSpan = Math.ceil(contentHeight / (rowHeight + rowGap));

        $cell.style.gridRowEnd = `span ${rowSpan}`;
      }
    },

    // Check a size of every cell in the grid
    resizeAllGridItems() {
      const $gridCells = [].slice.call(MasonryLayout.$gridBox.children);
      const gridStyle = window.getComputedStyle(MasonryLayout.$gridBox);
      const gridAutoRows = parseInt(gridStyle.getPropertyValue('grid-auto-rows'), 10) || 0;
      const gridRowGap = parseInt(gridStyle.getPropertyValue('grid-row-gap'), 10) || 10;

      $gridCells.forEach(($cell) => {
        MasonryLayout.resizeGridItem($cell, gridAutoRows, gridRowGap);
      });
    },

    initialise() {
      MasonryLayout.$gridBox = document.querySelector('#cpanel-modules .card-columns');
      MasonryLayout.resizeAllGridItems();

      // Watch on window resize
      window.addEventListener('resize', debounce(MasonryLayout.resizeAllGridItems, 50));
    },
  };

  // Initialise Masonry layout on full load,
  // to be sure all images/fonts are loaded, and so cards have a "final" size
  window.addEventListener('load', MasonryLayout.initialise);
})(window, document, window.Joomla);
