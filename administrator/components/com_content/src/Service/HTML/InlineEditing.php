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
	 * Name of the frontend controller that has saveInline() method defined.
	 *
	 * @var     string
	 *
	 * @since   __DEPLOY_VERSION__
	 */
	private $controller = 'article';

	/**
	 * Global configuration option.
	 *
	 * @var     boolean
	 *
	 * @since   __DEPLOY_VERSION__
	 */
	private $enabled = false;

	/**
	 * Service constructor
	 *
	 * @since   __DEPLOY_VERSION__
	 */
	public function __construct()
	{
		$app  = Factory::getApplication();
		$user = $app->getIdentity();
		$this->enabled = ($app->isClient('site') && $app->get('frontinlineediting', false) && !$user->guest);
	}

	/**
	 * Method to render an inline editable field
	 *
	 * @param   object  $item        The article information.
	 * @param   string  $display     Original value that needs to be inline editable.
	 * @param   string  $fieldName   Name of the corresponding form field.
	 * @param   string  $fieldGroup  The group to which the form field belongs.
	 *
	 * @return  string  $display wrapped inside inline editable container.
	 *
	 * @since  __DEPLOY_VERSION__
	 */
	public function render($item, string $display, string $fieldName, string $fieldGroup = null)
	{
		if (!$display || !$fieldName || !$item)
		{
			return;
		}

		$url = Uri::base() . 'index.php?option=com_content&a_id=' . $item->id;

		return LayoutHelper::render('joomla.content.inline_editing_item',
			['item'      => $item,
			'display'    => $display,
			'fieldName'  => $fieldName,
			'fieldGroup' => $fieldGroup,
			'url'        => $url,
			'controller' => $this->controller,
			'enabled' 	 => $this->enabled]
		);
	}
}
