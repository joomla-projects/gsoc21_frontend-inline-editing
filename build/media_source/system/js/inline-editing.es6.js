(() => {
  'use strict';

  const options = Joomla.getOptions('inline-editing');

  let selectedElement = null;
  document.documentElement.style.setProperty('--inline-editable-bg', 'blanchedalmond');

  document.body.innerHTML += '<div class="inline-editing-container"><form action="" class="inline-editing-form form-validate form-vertical"></form></div>';
  const container = document.querySelector('.inline-editing-container');
  const form = document.querySelector('.inline-editing-form');

  const hideContainer = () => {
    container.classList.add('d-none');
  };
  hideContainer();

  const cancelButton = document.createElement('button');
  const cancelButtonIcon = document.createElement('span');
  const saveButton = document.createElement('button');
  const saveButtonIcon = document.createElement('span');
  const buttons = document.createElement('span');

  // Save button
  saveButtonIcon.classList.add('icon-check');
  saveButtonIcon.setAttribute('aria-hidden', 'true');
  saveButton.type = 'button';
  saveButton.classList.add('btn-primary');
  Object.assign(saveButton.style, {
    margin: '2px 5px',
  });
  saveButton.appendChild(saveButtonIcon);

  // Cancel button
  cancelButtonIcon.classList.add('icon-times');
  cancelButtonIcon.setAttribute('aria-hidden', 'true');
  cancelButton.type = 'button';
  cancelButton.classList.add('btn-danger');
  Object.assign(cancelButton.style, {
    margin: '2px 5px',
  });
  cancelButton.appendChild(cancelButtonIcon);

  buttons.appendChild(saveButton);
  buttons.appendChild(cancelButton);
  Object.assign(buttons.style, {
    display: 'flex',
    'flex-direction': 'row',
    'align-items': 'center',
  });

  const { icon } = Joomla.getOptions('inline-editing');
  const cover = document.createElement('span');
  const loader = document.createElement('img');

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
    'z-index': 2,
  });
  Object.assign(cover.style, {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    'z-index': 1,
    'background-color': '#aad4f959',
  });

  const showLoader = () => {
    loader.classList.remove('d-none');
    cover.classList.remove('d-none');
  };
  const hideLoader = () => {
    loader.classList.add('d-none');
    cover.classList.add('d-none');
  };

  const appendLoader = (element, hidden = true) => {
    element.appendChild(loader);
    element.appendChild(cover);
    if (hidden) {
      hideLoader();
    } else {
      showLoader();
    }
  };

  container.appendChild(buttons);
  appendLoader(container);

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (selectedElement === null) {
      return;
    }

    appendLoader(container, false);
    const element = selectedElement;
    const key = element.classList[1];
    const inputField = form.children[0].children[1].children[0];
    const data = options[key];

    // Prepare the form data
    const formData = new FormData(form);
    formData.append('task', `${data.controller}.saveInline`);
    formData.append(Joomla.getOptions('csrf.token'), '1');

    if (document.formvalidator.isValid(form) === false) {
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

        if (response.success === true) {
          const value = response.data.savedValue;

          if (value !== null && value !== '') {
            element.innerHTML = value;
          } else {
            // remove the whole field from the dom.
          }
          element.classList.remove('d-none');
          selectedElement = null;
          document.documentElement.style.setProperty('--inline-editable-bg', 'blanchedalmond');
          hideContainer();
        } else {
          if (response.message) {
            Joomla.renderMessages({ error: [response.message] });
          }
          if (response.messages) {
            Joomla.renderMessages(response.messages);
          }
        }
      },
      onError: () => {
        Joomla.renderMessages({ error: ['Something went wrong!'] });
      },
      onComplete: () => {
        inputField.disabled = false;
        hideLoader();
      },
    });
  });

  saveButton.addEventListener('click', () => form.requestSubmit());

  cancelButton.addEventListener('click', () => {
    container.classList.add('d-none');
    if (selectedElement) {
      selectedElement.classList.remove('d-none');
      selectedElement = null;
    }
    document.documentElement.style.setProperty('--inline-editable-bg', 'blanchedalmond');
  });

  const addToContainer = (element, fieldHtml) => {
    // Add container as a sibling of element
    element.parentNode.insertBefore(container, element.nextSibling);

    // Add field Html to the container.
    form.innerHTML = fieldHtml;
    container.classList.remove('d-none');
    element.classList.add('d-none');

    const inputField = form.children[0].children[1].children[0];
    inputField.focus();
  };

  const addInputField = (element) => {
    selectedElement = element;
    document.documentElement.style.setProperty('--inline-editable-bg', 'inherit');
    appendLoader(element, false);
    // return;
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
          selectedElement = null;
          document.documentElement.style.setProperty('--inline-editable-bg', 'blanchedalmond');
          return;
        }

        if (response.success === false) {
          selectedElement = null;
          document.documentElement.style.setProperty('--inline-editable-bg', 'blanchedalmond');
          if (response.message) {
            Joomla.renderMessages({ error: [response.message] });
          }
          if (response.messages) {
            Joomla.renderMessages(response.messages);
          }
        } else {
          hideLoader();
          // 1. Add to the DOM.
          addToContainer(element, response.data.html);
          // 2. Render field properly / Load scripts and styles

          // 3. addForm(element, response.data.html);
          // console.log(response.data.html);
        }
      },
      onError: () => {
        Joomla.renderMessages({ error: ['Something went wrong!'] });
        selectedElement = null;
        hideLoader();
        document.documentElement.style.setProperty('--inline-editable-bg', 'blanchedalmond');
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
