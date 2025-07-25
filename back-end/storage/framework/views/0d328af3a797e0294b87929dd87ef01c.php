<?php
    use Knuckles\Scribe\Tools\WritingUtils as u;
?>
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta content="IE=edge,chrome=1" http-equiv="X-UA-Compatible">
    <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
    <title><?php echo $metadata['title']; ?></title>

    <link href="https://fonts.googleapis.com/css?family=Open+Sans&display=swap" rel="stylesheet">

    <link rel="stylesheet" href="<?php echo $assetPathPrefix; ?>css/theme-default.style.css" media="screen">
    <link rel="stylesheet" href="<?php echo $assetPathPrefix; ?>css/theme-default.print.css" media="print">

    <script src="https://cdn.jsdelivr.net/npm/lodash@4.17.10/lodash.min.js"></script>

    <link rel="stylesheet"
          href="https://unpkg.com/@highlightjs/cdn-assets@11.6.0/styles/obsidian.min.css">
    <script src="https://unpkg.com/@highlightjs/cdn-assets@11.6.0/highlight.min.js"></script>

    <script src="https://cdnjs.cloudflare.com/ajax/libs/jets/0.14.1/jets.min.js"></script>

<?php if(isset($metadata['example_languages'])): ?>
    <style id="language-style">
        /* starts out as display none and is replaced with js later  */
        <?php $__currentLoopData = $metadata['example_languages']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $lang): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
            body .content .<?php echo e($lang); ?>-example code { display: none; }
        <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
    </style>
<?php endif; ?>

<?php if($tryItOut['enabled'] ?? true): ?>
    <script>
        var tryItOutBaseUrl = "<?php echo $tryItOut['base_url'] ?? $baseUrl; ?>";
        var useCsrf = Boolean(<?php echo $tryItOut['use_csrf'] ?? null; ?>);
        var csrfUrl = "<?php echo $tryItOut['csrf_url'] ?? null; ?>";
    </script>
    <script src="<?php echo e(u::getVersionedAsset($assetPathPrefix.'js/tryitout.js')); ?>"></script>
<?php endif; ?>

    <script src="<?php echo e(u::getVersionedAsset($assetPathPrefix.'js/theme-default.js')); ?>"></script>

</head>

<body data-languages="<?php echo e(json_encode($metadata['example_languages'] ?? [])); ?>">

<?php echo $__env->make("scribe::themes.default.sidebar", array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

<div class="page-wrapper">
    <div class="dark-box"></div>
    <div class="content">
        <?php echo $intro; ?>


        <?php echo $auth; ?>


        <?php echo $__env->make("scribe::themes.default.groups", array_diff_key(get_defined_vars(), ['__data' => 1, '__path' => 1]))->render(); ?>

        <?php echo $append; ?>

    </div>
    <div class="dark-box">
        <?php if(isset($metadata['example_languages'])): ?>
            <div class="lang-selector">
                <?php $__currentLoopData = $metadata['example_languages']; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $name => $lang): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                    <?php if (is_numeric($name)) $name = $lang; ?>
                    <button type="button" class="lang-button" data-language-name="<?php echo e($lang); ?>"><?php echo e($name); ?></button>
                <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
            </div>
        <?php endif; ?>
    </div>
</div>
</body>
</html>
<?php /**PATH C:\Users\pc cam\OneDrive\Bureau\PROJET 1CS\E-Doc\back-end\vendor\knuckleswtf\scribe\src/../resources/views//themes/default/index.blade.php ENDPATH**/ ?>