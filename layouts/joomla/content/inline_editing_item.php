<?php
/**
 * @package     Joomla.Site
 * @subpackage  Layout
 *
 * @copyright   (C) 2017 Open Source Matters, Inc. <https://www.joomla.org>
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

defined('_JEXEC') or die;

extract($displayData);
?>

<<?php echo $HtmlTag; ?>
	<?php if ($canEdit && $enabled) : ?>
		class="inline-editable <?php echo $dataClass ?>"
	<?php endif; ?>
	>
	<?php echo $content; ?>
</<?php echo $HtmlTag; ?>>
