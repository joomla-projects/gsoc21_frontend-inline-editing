(() => {
  'use strict';

  const options = Joomla.getOptions('inline-editing');

  document.body.innerHTML += '<form action="" class="inline-editing-container form-validate form-vertical"></form>';
  const container = document.querySelector('.inline-editing-container');
  let selectedElement = null;

  container.addEventListener('click', (e) => e.stopPropagation());

  const resetContainer = () => {
    container.style = null;
    container.innerHTML = null;
    container.classList.add('d-none');
  };
  resetContainer();

  container.addEventListener('submit', (event) => {
    event.preventDefault();
    if (selectedElement === null) {
      return;
    }

    const element = selectedElement;
    const key = element.classList[1];
    const inputField = container.children[0].children[1].children[0];
    const data = options[key];

    // Prepare the form data
    const formData = new FormData(container);
    formData.append('task', `${data.controller}.saveInline`);
    formData.append(Joomla.getOptions('csrf.token'), '1');

    if (document.formvalidator.isValid(container) === false) {
      return;
    }

    inputField.disabled = true;

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

        if (response.message) {
          Joomla.renderMessages({ error: [response.message] });
        }

        if (response.messages) {
          Joomla.renderMessages(response.messages);
        }

        if (response.success === true) {
          const value = response.data.savedValue;

          if (value !== null && value !== '') {
            element.innerHTML = value;
          } else {
            // remove the whole field from the dom.
          }
          element.classList.remove('d-none');
          selectedElement = null;
          resetContainer();
        }
      },
      onError: () => {
        Joomla.renderMessages({ error: ['Something went wrong!'] });
      },
      onComplete: () => {
        inputField.disabled = false;
      },
    });
  });

  document.addEventListener('click', () => container.requestSubmit());

  const addToContainer = (element, fieldHtml) => {
    // Add container as a sibling of element
    element.parentNode.insertBefore(container, element.nextSibling);

    // Add field Html to the container.
    container.innerHTML = fieldHtml;
    container.classList.remove('d-none');
    element.classList.add('d-none');

    const inputField = container.children[0].children[1].children[0];
    inputField.focus();
  };

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
          // 1. Add to the DOM.
          selectedElement = element;
          addToContainer(element, response.data.html);
          // 2. Render field properly / Load scripts and styles

          // 3. addForm(element, response.data.html);
          // console.log(response.data.html);
        }
      },
      onError: () => {
        Joomla.renderMessages({ error: ['Something went wrong!'] });
      },
    });
  };

  const elements = document.querySelectorAll('[class*="inline-editable"]');
  elements.forEach((element) => element.addEventListener('click', () => {
    if (selectedElement === null) {
      addInputField(element);
    }
  }));
})();
