<?php
/**
 * @package     Joomla.Site
 * @subpackage  com_fields
 *
 * @copyright   (C) 2016 Open Source Matters, Inc. <https://www.joomla.org>
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */
defined('_JEXEC') or die;

use Joomla\Component\Fields\Administrator\Helper\FieldsHelper;
use Joomla\CMS\Factory;
use Joomla\CMS\Uri\Uri;
use Joomla\CMS\Language\Text;

// Check if we have all the data
if (!array_key_exists('item', $displayData) || !array_key_exists('context', $displayData))
{
	return;
}

// Setting up for display
$item = $displayData['item'];

if (!$item)
{
	return;
}

$context = $displayData['context'];

if (!$context)
{
	return;
}

$parts     = explode('.', $context);
$component = $parts[0];
$fields    = null;

if (array_key_exists('fields', $displayData))
{
	$fields = $displayData['fields'];
}
else
{
	$fields = $item->jcfields ?: FieldsHelper::getFields($context, $item, true);
}

if (empty($fields))
{
	return;
}

$canEdit = $item->params->get('access-edit');
if($canEdit)
{
	// Load inline editing script
	$doc = Factory::getDocument();
	$doc->getWebAssetManager()
		->useStyle('webcomponent.inline-editing')
		->useScript('webcomponent.inline-editing');
	// Add script options
	$doc->addScriptOptions('inline-editing', ['icon' => Uri::root(true) . '/media/system/images/ajax-loader.gif']);

	// Register messages to be used by javascript code
	Text::script('JGLOBAL_SERVER_ERROR');
	Text::script('JGLOBAL_FIELD_NOT_SAVED');
}

$output = array();

foreach ($fields as $field)
{
	// If the value is empty do nothing
	if (!isset($field->value) || trim($field->value) === '')
	{
		continue;
	}

	$class = $field->params->get('render_class');
	$layout = $field->params->get('layout', 'render');
	$content = FieldsHelper::render($context, 'field.' . $layout, array('field' => $field, 'item' => $item));

	// If the content is empty do nothing
	if (trim($content) === '')
	{
		continue;
	}

	$output[] = '<li class="field-entry ' . $class . '">' . $content . '</li>';
}

if (empty($output))
{
	return;
}
?>
<ul class="fields-container">
	<?php echo implode("\n", $output); ?>
</ul>
