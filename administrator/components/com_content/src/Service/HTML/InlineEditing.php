<?php
/**
 * @package     Joomla.Administrator
 * @subpackage  com_content
 *
 * @copyright   (C) 2018 Open Source Matters, Inc. <https://www.joomla.org>
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

namespace Joomla\Component\Content\Administrator\Service\HTML;

\defined('_JEXEC') or die;

use Joomla\CMS\Factory;
use Joomla\CMS\Layout\LayoutHelper;
use Joomla\CMS\Uri\Uri;

/**
 * Inline editing HTML Helper
 *
 * @since  __DEPLOY_VERSION__
 */
class InlineEditing
{
	/**
	 * The application
	 *
	 * @var    CMSApplication
	 *
	 * @since  __DEPLOY_VERSION__
	 */
	private $app;

	/**
	 * Name of the frontend controller that has saveInline() method defined.
	 *
	 * @var    string
	 *
	 * @since  __DEPLOY_VERSION__
	 */
	private $controller = 'article';

	/**
	 * Global configuration option.
	 *
	 * @var    boolean
	 *
	 * @since  __DEPLOY_VERSION__
	 */
	private $enabled = false;

	/**
	 * Serial number of Inline editable field.
	 *
	 * @var    integer
	 *
	 * @since  __DEPLOY_VERSION__
	 */
	private $num = 1;

	/**
	 * Service constructor
	 *
	 * @since  __DEPLOY_VERSION__
	 */
	public function __construct()
	{
		$this->app     = Factory::getApplication();
		$user          = $this->app->getIdentity();
		$this->enabled = ($this->app->isClient('site') && $this->app->get('frontinlineediting', false) && !$user->guest);
	}

	/**
	 * Method to render an inline editable field
	 *
	 * @param   object  $item        The article information.
	 * @param   string  $content     Original value that needs to be inline editable.
	 * @param   string  $fieldName   Name of the corresponding form field.
	 * @param   string  $fieldGroup  The group to which the form field belongs.
	 * @param   string  $HtmlTag     HTML Tag to wrap the content.
	 *
	 * @return  string  $content wrapped inside inline editable container.
	 *
	 * @since  __DEPLOY_VERSION__
	 */
	public function render($item, string $content, string $fieldName, string $fieldGroup = null, string $HtmlTag = "span")
	{
		if (!$content || !$fieldName || !$item)
		{
			return;
		}

		$url     = Uri::base() . 'index.php?option=com_content&a_id=' . $item->id;
		$canEdit = $item->params->get('access-edit');
		$dataClass = '';

		if ($canEdit && $this->enabled)
		{
			$document = $this->app->getDocument();
			$wa       = $document->getWebAssetManager();
			$wa->useStyle('webcomponent.inline-editing')
				->useScript('keepalive')
				->useScript('form.validate')
				->useScript('webcomponent.inline-editing');

			// Add script options.
			$document->addScriptOptions('inline-editing', ['icon' => Uri::root(true) . '/media/system/images/ajax-loader.gif']);

			// Might be replaced with global inline editing registery
			// or with something else if we define a library for inline editing.
			$dataClass = 'ie-content-item-' . $this->num;
			$this->num = $this->num + 1;

			$document->addScriptOptions('inline-editing', [
					$dataClass => [
						'fieldName'  => $fieldName,
						'fieldGroup' => $fieldGroup,
						'url'        => $url,
						'controller' => $this->controller,
					],
				]
			);
		}

		return LayoutHelper::render('joomla.content.inline_editing_item', [
				'canEdit'   => $canEdit,
				'content'   => $content,
				'HtmlTag'   => $HtmlTag,
				'dataClass' => $dataClass,
				'enabled'   => $this->enabled,
			]
		);
	}
}
