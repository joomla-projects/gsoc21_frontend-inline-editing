<?php
/**
 * @package     Joomla.Plugin
 * @subpackage  Fields.Textarea
 *
 * @copyright   (C) 2017 Open Source Matters, Inc. <https://www.joomla.org>
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */
defined('_JEXEC') or die;

use Joomla\CMS\HTML\HTMLHelper;

$value = $field->value;

if ($value == '')
{
	return;
}

$output = HTMLHelper::_('content.prepare', $value);

try
{
	echo HTMLHelper::_('InlineEditing.render', $item, $output, $field->name, 'com_fields');
}
catch (Exception $e)
{
	echo $output;
}
