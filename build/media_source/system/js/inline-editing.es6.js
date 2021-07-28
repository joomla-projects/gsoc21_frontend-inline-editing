(() => {
  'use strict';

  // const addForm = (element, field) => {
  // const dimensions = element.getBoundingClientRect();
  // console.log(element, field);
  // [TODO] create and add a form
  // makeForm();
  // append it to the body and give it an absolute position
  // };

  const options = Joomla.getOptions('inline-editing');

  const addInputField = (element) => {
    const key = element.classList[1];
    const data = options[key];

    // Prepare the form data
    const formData = new FormData();
    formData.append('field_name', data.fieldName);
    if (data.fieldGroup != null) {
      formData.append('field_group', data.fieldGroup);
    }
    formData.append('task', `${data.controller}.getRenderedFormField`);
    formData.append(Joomla.getOptions('csrf.token'), '1');

    // Make the ajax call
    Joomla.request({
      url: data.url,
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
          // addForm(element, response.data.html);
          // console.log(response.data.html);
        }
      },
      onError: () => {
        Joomla.renderMessages({ error: ['Something went wrong!'] });
      },
    });
  };

  const elements = document.querySelectorAll('[class*="inline-editable"]');
  elements.forEach((element) => element.addEventListener('click', () => addInputField(element)));
})();
