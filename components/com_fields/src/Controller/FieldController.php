<?php
/**
 * @package     Joomla.Site
 * @subpackage  com_fields
 *
 * @copyright   (C) 2017 Open Source Matters, Inc. <https://www.joomla.org>
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

namespace Joomla\Component\Fields\Site\Controller;

\defined('_JEXEC') or die;

use Joomla\CMS\Response\JsonResponse;

/**
 * Custom Field class.
 *
 * @since  __DEPLOY_VERSION__
 */
class FieldController extends \Joomla\CMS\MVC\Controller\BaseController
{

	/**
	 * Method to save a field
	 *
	 * @return  void
	 *
	 * @since __DEPLOY_VERSION__
	 */
	public function FEInlineEdition()
	{
		$this->checkToken();

		$fieldId = $this->input->getInt('field_id');
		$itemId = $this->input->getInt('item_id');
		$value = $this->input->getString('value');

		if (!$fieldId || !$itemId || !$value)
		{
			echo new JsonResponse(['saved' => false]);

			return;
		}

		$model = $this->getModel('field', 'Administrator');

		if ($model && $model->setFieldValue($fieldId, $itemId, $value))
		{
			echo new JsonResponse(['saved' => true]);
		}
		else
		{
			echo new JsonResponse(['saved' => false]);
		}
	}
}
