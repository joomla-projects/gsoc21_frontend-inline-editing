(() => {
  'use strict';

  // TODO
  // Shift some code to css file

  // Get text area and loading icon
  const GetTextAreaWrapper = (oldContent) => {
    const { icon } = Joomla.getOptions('inline-editing');

    const textArea = document.createElement('textarea');
    const loader = document.createElement('img');
    const wrap = document.createElement('div');

    if (!icon || !loader || !textArea || !wrap) {
      return null;
    }

    // TextArea field
    textArea.value = oldContent;
    textArea.rows = 1;
    textArea.style.width = 'auto';

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
    wrap.classList.add('d-none');
    wrap.style.position = 'relative';
    wrap.style.display = 'inline-block';
    wrap.appendChild(textArea);
    wrap.appendChild(loader);

    return { wrap, textArea, loader };
  };

  const Error = (element) => {
    element.classList.add('highlight-error');
    setTimeout(() => {
      element.classList.remove('highlight-error');
    }, 2000);
  };

  // Handle custom fields
  const FieldHelper = ({ itemId, fieldId, _this }) => {
    const oldContent = _this.innerText;

    const wrapAndTextArea = GetTextAreaWrapper(oldContent);
    if (!wrapAndTextArea) {
      return;
    }
    const { wrap, textArea, loader } = wrapAndTextArea;

    // Add wrap to the DOM
    _this.parentNode.insertBefore(wrap, _this.nextSibling);

    // Hide custom field value and show a text area
    _this.classList.add('d-none');
    wrap.classList.remove('d-none');
    textArea.focus();

    // Send Ajax request and update front-end when user focuses out of textArea
    textArea.addEventListener('focusout', () => {
      // replace focus-out with something more suitable
      //    maybe focus-out and windows.still_focused
      // console.log(document.hidden)
      // if(!document.hasFocus())
      // {
      //   console.log('fsadf')
      //   return;
      // }

      const newValue = textArea.value;
      const url = '?option=com_fields&task=Field.saveField&format=json';
      const data = `field_id=${fieldId}&item_id=${itemId}&value=${newValue}&${Joomla.getOptions('csrf.token', '')}=1`;

      textArea.disabled = true;
      loader.classList.remove('d-none');

      const AjaxEnd = () => {
        wrap.remove();
        _this.classList.remove('d-none');
      };

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

          AjaxEnd();
        },
        onError: () => {
          Error(_this);
          AjaxEnd();
        },
      });
    });
  };

  // First argument/context: article_title, article_content, custom_text_field, module, etc
  Joomla.inlineEditing = (params) => {
    const { context } = params;

    switch (context) {
      case 'custom_text_field':
        FieldHelper(params);
        break;

      default:
        break;
    }
  };
})();
