/**
 * @copyright  (C) 2019 Open Source Matters, Inc. <https://www.joomla.org>
 * @license    GNU General Public License version 2 or later; see LICENSE.txt
 */
// The container where the draggable will be enabled
let url;
let direction;
let isNested;
let dragElementIndex;
let dropElementIndex;
let container = document.querySelector('.js-draggable');
const orderRows = container.querySelectorAll('[name="order[]"]');

if (container) {
  /** The script expects a form with a class js-form
   *  A table with the tbody with a class js-draggable
   *                         with a data-url with the ajax request end point and
   *                         with a data-direction for asc/desc
   */
  url = container.dataset.url;
  direction = container.dataset.direction;
  isNested = container.dataset.nested;
} else if (Joomla.getOptions('draggable-list')) {
  const options = Joomla.getOptions('draggable-list');

  container = document.querySelector(options.id);
  /**
   * This is here to make the transition to new forms easier.
   */
  if (!container.classList.contains('js-draggable')) {
    container.classList.add('js-draggable');
  }

  ({ url } = options);
  ({ direction } = options);
  isNested = options.nested;
}

if (container) {
  // Add data order attribute for initial ordering
  for (let i = 0, l = orderRows.length; l > i; i += 1) {
    orderRows[i].dataset.order = i + 1;
  }

  // IOS 10 BUG
  document.addEventListener('touchstart', () => {}, false);

  const getOrderData = (rows, inputRows, dragIndex, dropIndex) => {
    let i;
    const result = [];

    // Element is moved down
    if (dragIndex < dropIndex) {
      rows[dropIndex].setAttribute('value', rows[dropIndex - 1].value);

      // Move down
      for (i = dragIndex; i < dropIndex; i += 1) {
        if (direction === 'asc') {
          rows[i].setAttribute('value', parseInt(rows[i].value, 10) - 1);
        } else {
          rows[i].setAttribute('value', parseInt(rows[i].value, 10) + 1);
        }

        result.push(`order[]=${encodeURIComponent(rows[i].value)}`);
        result.push(`cid[]=${encodeURIComponent(inputRows[i].value)}`);
      }

      result.push(`order[]=${encodeURIComponent(rows[dropIndex].value)}`);
      result.push(`cid[]=${encodeURIComponent(inputRows[dropIndex].value)}`);
    } else {
      // Element is moved up

      rows[dropIndex].setAttribute('value', rows[dropIndex + 1].value);
      rows[dropIndex].value = rows[dropIndex + 1].value;

      result.push(`order[]=${encodeURIComponent(rows[dropIndex].value)}`);
      result.push(`cid[]=${encodeURIComponent(inputRows[dropIndex].value)}`);

      for (i = dropIndex + 1; i <= dragIndex; i += 1) {
        if (direction === 'asc') {
          rows[i].value = parseInt(rows[i].value, 10) + 1;
        } else {
          rows[i].value = parseInt(rows[i].value, 10) - 1;
        }

        result.push(`order[]=${encodeURIComponent(rows[i].value)}`);
        result.push(`cid[]=${encodeURIComponent(inputRows[i].value)}`);
      }
    }

    return result;
  };

  // eslint-disable-next-line no-undef
  dragula([container], {
    // Y axis is considered when determining where an element would be dropped
    direction: 'vertical',
    // elements are moved by default, not copied
    copy: false,
    // elements in copy-source containers can be reordered
    // copySortSource: true,
    // spilling will put the element back where it was dragged from, if this is true
    revertOnSpill: true,
    // spilling will `.remove` the element, if this is true
    // removeOnSpill: false,

    accepts(el, target, source, sibling) {
      if (isNested) {
        if (sibling !== null) {
          return sibling.dataset.draggableGroup
            && sibling.dataset.draggableGroup === el.dataset.draggableGroup;
        }

        return sibling === null || (sibling && sibling.tagName.toLowerCase() === 'tr');
      }

      return sibling === null || (sibling && sibling.tagName.toLowerCase() === 'tr');
    },

    mirrorContainer: container,
  })
    .on('drag', (el) => {
      let rowSelector;
      const groupId = el.dataset.draggableGroup;

      if (groupId) {
        rowSelector = `tr[data-draggable-group="${groupId}"]`;
      } else {
        rowSelector = 'tr';
      }

      const rowElements = [].slice.call(container.querySelectorAll(rowSelector));

      dragElementIndex = rowElements.indexOf(el);
    })
    .on('cloned', () => {

    })
    .on('drop', (el) => {
      let orderSelector;
      let inputSelector;
      let rowSelector;

      const groupId = el.dataset.draggableGroup;

      if (groupId) {
        rowSelector = `tr[data-draggable-group="${groupId}"]`;
        orderSelector = `[data-draggable-group="${groupId}"] [name="order[]"]`;
        inputSelector = `[data-draggable-group="${groupId}"] [name="cid[]"]`;
      } else {
        rowSelector = 'tr';
        orderSelector = '[name="order[]"]';
        inputSelector = '[name="cid[]"]';
      }

      const rowElements = [].slice.call(container.querySelectorAll(rowSelector));
      const rows = [].slice.call(container.querySelectorAll(orderSelector));
      const inputRows = [].slice.call(container.querySelectorAll(inputSelector));

      dropElementIndex = rowElements.indexOf(el);

      if (url) {
        // Detach task field if exists
        const task = document.querySelector('[name="task"]');

        // Detach task field if exists
        if (task) {
          task.setAttribute('name', 'some__Temporary__Name__');
        }

        // Prepare the options
        const ajaxOptions = {
          url,
          method: 'POST',
          data: getOrderData(rows, inputRows, dragElementIndex, dropElementIndex).join('&'),
          perform: true,
        };

        Joomla.request(ajaxOptions);

        // Re-Append original task field
        if (task) {
          task.setAttribute('name', 'task');
        }
      }
    })
    .on('dragend', () => {
      const elements = container.querySelectorAll('[name="order[]"]');
      // Reset data order attribute for initial ordering
      for (let i = 0, l = elements.length; l > i; i += 1) {
        elements[i].dataset.order = i + 1;
      }
    });
}
