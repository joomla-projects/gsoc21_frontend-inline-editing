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
    textArea.rows = 3;
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

  const Error = (saveButton, cancelButton, textArea, loader) => {
    saveButton.disabled = false;
    cancelButton.disabled = false;
    saveButton.classList.add('btn-primary');
    cancelButton.classList.add('btn-danger');
    textArea.disabled = false;
    loader.classList.add('d-none');
  };

  // Handle any text fields
  const addTextArea = (url, data, element) => {
    const oldContent = element.innerText;

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
    element.parentNode.insertBefore(wrap, element.nextSibling);

    // Hide custom field value and show a text area
    element.classList.add('d-none');
    textArea.focus();

    // Restore original element on Cancel
    cancelButton.addEventListener('click', () => {
      wrap.remove();
      element.classList.remove('d-none');
    });

    // Send Ajax request and update front-end when user focuses out of textArea
    saveButton.addEventListener('click', () => {
      const newValue = textArea.value;
      const dataWithValue = `${data}value=${newValue}`;

      saveButton.disabled = true;
      cancelButton.disabled = true;
      saveButton.classList.remove('btn-primary');
      cancelButton.classList.remove('btn-danger');
      textArea.disabled = true;
      loader.classList.remove('d-none');

      Joomla.request({
        url,
        method: 'POST',
        data: dataWithValue,
        onSuccess: (response) => {
          const responseJson = JSON.parse(response);

          if (responseJson.data.saved === true) {
            element.innerHTML = newValue;
            wrap.remove();
            element.classList.remove('d-none');
          } else {
            Error(saveButton, cancelButton, textArea, loader);
            Joomla.renderMessages({ error: [Joomla.Text._('JGLOBAL_FIELD_NOT_SAVED')] });
          }
        },
        onError: () => {
          Error(saveButton, cancelButton, textArea, loader);
          Joomla.renderMessages({ error: [Joomla.Text._('JGLOBAL_SERVER_ERROR')] });
        },
      });
    });
  };

  const functionMap = {
    'inline-editable-text': addTextArea,
  };

  // First argument/context: inline-editable-text, inline-editable-color-field, etc
  const initInlineEditing = () => {
    const elements = document.querySelectorAll('[class*="inline-editable"]');

    elements.forEach((element) => {
      let type;
      element.classList.forEach((value) => {
        if (value.startsWith('inline-editable')) {
          type = value;
        }
      });

      const url = element.dataset.inline_url;
      let data = element.dataset.inline_data;
      if (!type || !url || !data) {
        return;
      }

      const currentMethod = functionMap[type];
      if (!currentMethod) {
        return;
      }

      data = `${data}${Joomla.getOptions('csrf.token', '')}=1&`;

      element.addEventListener('click', () => currentMethod(url, data, element));
    });
  };

  document.addEventListener('DOMContentLoaded', initInlineEditing);
})();
