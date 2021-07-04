<?php
/**
 * @package     Joomla.Site
 * @subpackage  com_fields
 *
 * @copyright   (C) 2016 Open Source Matters, Inc. <https://www.joomla.org>
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */
defined('_JEXEC') or die;

use Joomla\CMS\Language\Text;
use Joomla\CMS\HTML\HTMLHelper;

if (!array_key_exists('field', $displayData))
{
	return;
}

$item = $displayData['item'];
$field = $displayData['field'];
$label = Text::_($field->label);
$value = $field->value;
$showLabel = $field->params->get('showlabel');
$prefix = Text::plural($field->params->get('prefix'), $value);
$suffix = Text::plural($field->params->get('suffix'), $value);
$labelClass = $field->params->get('label_render_class');

if ($value == '')
{
	return;
}

$canEdit = $item->params->get('access-edit');
$dataAttributes = '';
$inlineEditClass = '';

if ($canEdit && $field->type == 'text')
{
	$dataAttributes = HTMLHelper::_('convertToDataAttributes', 'com_fields', [ 'item_id' => $item->id, 'field_id' => $field->id ]);
	$inlineEditClass = 'inline-editable-text';
}

?>
<?php if ($showLabel == 1) : ?>
	<span class="field-label <?php echo $labelClass; ?>"><?php echo htmlentities($label, ENT_QUOTES | ENT_IGNORE, 'UTF-8'); ?>: </span>
<?php endif; ?>
<?php if ($prefix) : ?>
	<span class="field-prefix"><?php echo htmlentities($prefix, ENT_QUOTES | ENT_IGNORE, 'UTF-8'); ?></span>
<?php endif; ?>
<span class="field-value <?php echo $inlineEditClass ?> "  <?php echo $dataAttributes ?> ><?php echo $value; ?></span>
<?php if ($suffix) : ?>
	<span class="field-suffix"><?php echo htmlentities($suffix, ENT_QUOTES | ENT_IGNORE, 'UTF-8'); ?></span>
<?php endif; ?>
