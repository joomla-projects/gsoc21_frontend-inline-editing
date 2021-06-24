(() => {
  'use strict';

  Joomla.addTextArea = (articleId) => {
    const contentDiv = document.getElementsByClassName('com-content-article')[0];
    if(!contentDiv || !articleId)
    {
      return;
    }

    const { icon } = Joomla.getOptions('add-textarea');

    const headline = contentDiv.querySelector('[itemprop="headline"]');
    const textArea = document.createElement('textarea');
    const loader = document.createElement('img');
    const wrap = document.createElement('div');
    if (!icon || !loader || !headline || !textArea || !wrap)
    {
      return;
    }

    const oldTitle = headline.innerText;

    // TextArea field
    textArea.value = oldTitle;
    textArea.rows = 1;
    textArea.style.width = '100%';

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
      margin: 'auto'
    });
    loader.classList.add('d-none');

    // Wrap textArea and loader inside a div
    wrap.classList.add('d-none');
    wrap.style.position = 'relative';
    wrap.appendChild(textArea);
    wrap.appendChild(loader);

    // Add wrap to the DOM
    headline.parentNode.insertBefore(wrap, headline.nextSibling)

    // Show textArea when title header is clicked
    headline.addEventListener('click', function () {
      textArea.value = headline.innerText;
      headline.classList.add('d-none');
      wrap.classList.remove('d-none');
      textArea.focus();
    });

    // Send Ajax request and update front-end when user focuses out of textArea
    textArea.addEventListener('focusout', function () {
      const newTitle = textArea.value;
      textArea.disabled = true;

      const url = `index.php?option=com_content&task=article.saveTitle&format=json`;
      const data = `a_id=${articleId}&a_title=${newTitle}&${Joomla.getOptions('csrf.token', '')}=1`;

      loader.classList.remove('d-none');

      Joomla.request({
        url,
        method: 'POST',
        data,
        onSuccess: (response) => {
          response = JSON.parse(response);

          if (response.data.saved == true)
          {
            headline.innerHTML = newTitle;
          }
          else
          {
            if(response.data.permission == false)
            {
              Joomla.renderMessages({ error: [Joomla.Text._('COM_CONTENT_NOT_ALLOWED')] });
            }
            else
            {
              Joomla.renderMessages({ error: [Joomla.Text._('COM_CONTENT_SAVE_ERROR')] });
            }
          }

          AjaxEnd();
        },
        onError: () => {
          Joomla.renderMessages({ error: [Joomla.Text._('COM_CONTENT_SERVER_ERROR')] });

          AjaxEnd();
        }
      });

      function AjaxEnd() {
        wrap.classList.add('d-none');
        loader.classList.add('d-none');
        textArea.disabled = false;

        headline.classList.remove('d-none');
      }
    });
  }
})();
  