(() => {
  'use strict';

  Joomla.addTextArea = (articleId) => {
    const contentDiv = document.getElementsByClassName('com-content-article')[0];
    if(!contentDiv || !articleId)
    {
      return;
    }

    const headline = contentDiv.querySelector('[itemprop="headline"]');
    const titleInput = document.createElement('textarea');
    if (!titleInput || !headline)
    {
      return;
    }

    const oldTitle = headline.innerText;

    titleInput.value = oldTitle;
    titleInput.className = 'd-none';
    titleInput.rows = 1;
    titleInput.style.width = '100%';

    headline.parentNode.insertBefore(titleInput, headline.nextSibling)

    headline.addEventListener('click', function () {
      titleInput.value = headline.innerText;
      headline.classList.add('d-none');
      titleInput.classList.remove('d-none');
      titleInput.focus();
    });

    titleInput.addEventListener('focusout', function () {
      const newTitle = titleInput.value;
      titleInput.disabled = true;

      const url = `index.php?option=com_content&task=article.saveTitle&format=json`;
      const data = `a_id=${articleId}&a_title=${newTitle}&${Joomla.getOptions('csrf.token', '')}=1`;

      document.body.appendChild(document.createElement('joomla-core-loader'));

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
        titleInput.classList.add('d-none');
        headline.classList.remove('d-none');
        titleInput.disabled = false;

        var spinner = document.querySelector('joomla-core-loader');
        if (spinner)
        {
          spinner.parentNode.removeChild(spinner);
        }
      }
    });
  }
})();
  