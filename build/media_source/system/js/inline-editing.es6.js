(() => {
  'use strict';

  // TODO
  // Shift some code to the css file

  // Get text area and loading icon
  const GetTextAreaWrapper = (oldContent) => {
    const { icon } = Joomla.getOptions('inline-editing');

    const textArea = document.createElement('textarea');
    const loader = document.createElement('img');
    const wrap = document.createElement('div');

    const cancelButton = document.createElement('button');
    const cancelButtonIcon = document.createElement('span');
    const saveButton = document.createElement('button');
    const saveButtonIcon = document.createElement('span');
    const buttons = document.createElement('span');

    if (!icon || !loader || !textArea || !wrap || !cancelButton || !cancelButtonIcon) {
      return null;
    }

    // TextArea field
    textArea.value = oldContent;
    textArea.rows = 1;
    textArea.style.width = 'auto';

    // Cancel button
    cancelButtonIcon.classList.add('icon-times');
    cancelButtonIcon.setAttribute('aria-hidden', 'true');
    cancelButton.type = 'button';
    cancelButton.classList.add('btn-danger');
    Object.assign(cancelButton.style, {
      margin: '2px',
    });
    cancelButton.appendChild(cancelButtonIcon);

    // Save button
    saveButtonIcon.classList.add('icon-check');
    saveButtonIcon.setAttribute('aria-hidden', 'true');
    saveButton.type = 'button';
    saveButton.classList.add('btn-primary');
    Object.assign(saveButton.style, {
      margin: '2px',
    });
    saveButton.appendChild(saveButtonIcon);

    buttons.appendChild(cancelButton);
    buttons.appendChild(saveButton);
    Object.assign(buttons.style, {
      float: 'left',
      display: 'flex',
      'flex-direction': 'column',
      'align-items': 'center',
    });

    // Loading icon
    loader.src = icon;
    loader.width = 30;
    loader.height = 30;
    Object.assign(loader.style, {
      position: 'absolute',
      top: 0,
      bottom: 0,
      left: 0,
      right: 0,
      margin: 'auto',
    });
    loader.classList.add('d-none');

    // Wrap textArea and loader inside a div
    wrap.style.position = 'relative';
    wrap.style.display = 'inline-block';
    wrap.appendChild(buttons);
    wrap.appendChild(textArea);
    wrap.appendChild(loader);

    return {
      wrap,
      textArea,
      loader,
      cancelButton,
      saveButton,
    };
  };

  const Error = (element) => {
    element.classList.add('highlight-error');
    setTimeout(() => {
      element.classList.remove('highlight-error');
    }, 2000);
  };

  // Handle custom fields
  const FieldHelper = (itemId, fieldId, _this) => {
    const oldContent = _this.innerText;

    const wrapAndTextArea = GetTextAreaWrapper(oldContent);
    if (!wrapAndTextArea) {
      return;
    }
    const {
      wrap,
      textArea,
      loader,
      cancelButton,
      saveButton,
    } = wrapAndTextArea;

    // Add wrap to the DOM
    _this.parentNode.insertBefore(wrap, _this.nextSibling);

    // Hide custom field value and show a text area
    _this.classList.add('d-none');
    textArea.focus();

    let cancel = false;
    // Restore original element on Cancel
    cancelButton.addEventListener('click', () => {
      cancel = true;
      wrap.remove();
      _this.classList.remove('d-none');
    });

    // Send Ajax request and update front-end when user focuses out of textArea
    // TODO: Implement save button
    saveButton.addEventListener('click', () => {
      const AjaxCall = () => {
        const newValue = textArea.value;
        const url = '?option=com_fields&task=Field.saveField&format=json';
        const data = `field_id=${fieldId}&item_id=${itemId}&value=${newValue}&${Joomla.getOptions('csrf.token', '')}=1`;

        saveButton.disabled = true;
        cancelButton.disabled = true;
        saveButton.style.backgroundColor = 'grey';
        cancelButton.style.backgroundColor = 'grey';
        textArea.disabled = true;
        loader.classList.remove('d-none');

        Joomla.request({
          url,
          method: 'POST',
          data,
          onSuccess: (response) => {
            const responseJson = JSON.parse(response);

            if (responseJson.data.saved === true) {
              _this.innerHTML = newValue;
            } else {
              Error(_this);
            }
          },
          onError: () => {
            Error(_this);
          },
          onComplete: () => {
            wrap.remove();
            _this.classList.remove('d-none');
          },
        });
      };

      setTimeout(() => {
        if (!document.hasFocus() || cancel) {
          return;
        }
        AjaxCall();
      }, 200);
    });
  };

  // First argument/context: article_title, article_content, custom_text_field, module, etc
  const initInlineEditing = () => {
    const elements = document.querySelectorAll('.inline-editable');

    elements.forEach((element) => {
      const { context } = element.dataset;
      if (!context) {
        return;
      }

      switch (context) {
        case 'custom_text_field': {
          const itemId = element.dataset.item_id;
          const fieldId = element.dataset.field_id;
          if (!itemId || !fieldId) {
            return;
          }
          element.addEventListener('click', () => FieldHelper(itemId, fieldId, element));
          break;
        }
        default:
          break;
      }
    });
  };

  document.addEventListener('DOMContentLoaded', initInlineEditing);
})();
