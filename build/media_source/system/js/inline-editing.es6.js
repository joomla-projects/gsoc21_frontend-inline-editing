(() => {
  'use strict';

  const forms = document.querySelectorAll('[class*="inline-editing-form"]');

  const addInputField = (event) => {
    event.preventDefault();
    const form = event.target;
    const content = form.querySelector('[class*="inline-editing-content"]');
    const input = form.querySelector('[class*="inline-editing-input"]');

    // Prepare the form data
    const formData = new FormData(form);
    formData.append('field_name', input.dataset.inlineEditingField_name);
    formData.append('field_group', input.dataset.inlineEditingField_group);
    formData.set('task', `${formData.get('task')}getRenderedFormField`);

    // Make the ajax call
    Joomla.request({
      url: form.action,
      method: 'POST',
      data: formData,
      onSuccess: (resp) => {
        let response;

        try {
          response = JSON.parse(resp);
        } catch (e) {
          Joomla.renderMessages({ error: ['Invalid response.'] });
          return;
        }

        if (response.success === false) {
          if (response.message) {
            Joomla.renderMessages({ error: [response.message] });
          }
          if (response.messages) {
            Joomla.renderMessages(response.messages);
          }
        } else {
          content.remove();
          input.innerHTML = response.data.html;
          input.classList.remove('d-none');
          // console.log(response.data.html);
        }
      },
      onError: () => {
        Joomla.renderMessages({ error: ['Something went wrong!'] });
      },
    });
  };

  forms.forEach((form) => {
    const content = form.querySelector('[class*="inline-editing-content"]');

    content.addEventListener('click', () => {
      form.addEventListener('submit', addInputField);
      form.requestSubmit();
    });
  });
})();
