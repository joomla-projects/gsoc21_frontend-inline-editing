((tinyMCE) => {
  'use strict';

  const initInstanceCallback = (editor) => {
    const element = editor.getElement();
    if (!element) {
      return;
    }
    editor.on('focus', () => {
      element.classList.remove('inline-editable-text');
    });
    editor.on('blur', () => {
      element.classList.add('inline-editable-text');

      if (!editor.isDirty()) {
        return;
      }

      const newValue = ['DIV', 'P'].includes(element.tagName) ? editor.getContent() : editor.getContent({ format: 'text' });
      // Add checks. empty titles not allowed.

      const url = element.dataset.inline_url;
      let data = element.dataset.inline_data;
      if (!url || !data) {
        return;
      }

      const itemprop = element.getAttribute('itemprop');
      data = `${data}${Joomla.getOptions('csrf.token', '')}=1&value=${newValue}&itemprop=${itemprop}`;

      Joomla.request({
        url,
        method: 'POST',
        data,
        onSuccess: (response) => {
          const responseJson = JSON.parse(response);

          if (responseJson.data.saved === false) {
            Joomla.renderMessages({ error: [Joomla.Text._('JGLOBAL_FIELD_NOT_SAVED')] });
          }
        },
        onError: () => {
          Joomla.renderMessages({ error: [Joomla.Text._('JGLOBAL_SERVER_ERROR')] });
        },
      });
    });
  };

  document.addEventListener('DOMContentLoaded', () => {
    tinyMCE.init({
      selector: 'h1.inline-editable-text, h2.inline-editable-text, h3.inline-editable-text, span.inline-editable-text',
      menubar: false,
      inline: true,
      toolbar: [
        'undo redo',
      ],
      init_instance_callback: initInstanceCallback,
    });
    tinyMCE.init({
      selector: 'div.inline-editable-text',
      menubar: false,
      inline: true,
      toolbar: [
        'undo redo | bold italic underline | fontselect fontsizeselect',
        'forecolor backcolor | alignleft aligncenter alignright alignfull | numlist bullist outdent indent',
      ],
      init_instance_callback: initInstanceCallback,
    });
  });
})(window.tinyMCE);
