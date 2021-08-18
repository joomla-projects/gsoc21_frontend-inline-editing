<?php
/**
 * @package     Joomla.Plugin
 * @subpackage  Fields.Radio
 *
 * @copyright   (C) 2017 Open Source Matters, Inc. <https://www.joomla.org>
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */
defined('_JEXEC') or die;

use Joomla\CMS\HTML\HTMLHelper;
use Joomla\CMS\Language\Text;

$value = $field->value;

if ($value == '')
{
	return;
}

$value   = (array) $value;
$texts   = array();
$options = $this->getOptionsFromField($field);

foreach ($options as $optionValue => $optionText)
{
	if (in_array((string) $optionValue, $value))
	{
		$texts[] = Text::_($optionText);
	}
}

$output = htmlentities(implode(', ', $texts));

try
{
	echo HTMLHelper::_('InlineEditing.render', $item, $output, $field->name, 'com_fields');
}
catch (Exception $e)
{
	echo $output;
}