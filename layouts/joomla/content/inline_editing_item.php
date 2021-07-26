<?php
/**
 * @package     Joomla.Site
 * @subpackage  Layout
 *
 * @copyright   (C) 2017 Open Source Matters, Inc. <https://www.joomla.org>
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

defined('_JEXEC') or die;

use Joomla\CMS\HTML\HTMLHelper;

extract($displayData);

$canEdit = $displayData['item']->params->get('access-edit');
?>

<?php if ($canEdit && $enabled) : ?>
	<form class="inline-editing-form" action="<?php echo $url; ?>">
		<div class="inline-editing-content">
			<?php echo $content; ?>
		</div>
		<div class="inline-editing-input d-none"
			data-inline-editing-field_name="<?php echo $fieldName; ?>"
			data-inline-editing-field_group="<?php echo $fieldGroup; ?>">
		</div>
		<input type="hidden" name="task" value="<?php echo $controller; ?>.">
		<?php echo HTMLHelper::_('form.token'); ?>
	</form>
<?php else: ?>
	<?php echo $content; ?>
<?php endif; ?>
