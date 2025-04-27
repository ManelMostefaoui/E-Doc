<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Prescription #<?php echo e($prescription->id); ?></title>
    <style>
        body {
            font-family: DejaVu Sans, sans-serif;
            margin: 40px;
        }

        h2,
        h3 {
            text-align: center;
            margin-bottom: 10px;
        }

        p {
            margin: 5px 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }

        th,
        td {
            border: 1px solid #333;
            padding: 8px;
            text-align: left;
        }

        .header-info {
            margin-bottom: 20px;
        }
    </style>
</head>

<body>
    <h2>Medical Prescription</h2>

    <div class="header-info">
        <p><strong>Full Name:</strong> <?php echo e($prescription->full_name); ?></p>
        <p><strong>Age:</strong> <?php echo e($prescription->age); ?></p>
        <p><strong>Date:</strong> <?php echo e($prescription->date); ?></p>
    </div>

    <h3>Medications</h3>
    <table>
        <thead>
            <tr>
                <th>Name</th>
                <th>Dose</th>
                <th>Period</th>
            </tr>
        </thead>
        <tbody>
            <?php $__currentLoopData = $prescription->medications; $__env->addLoop($__currentLoopData); foreach($__currentLoopData as $med): $__env->incrementLoopIndices(); $loop = $__env->getLastLoop(); ?>
                <tr>
                    <td><?php echo e($med->name); ?></td>
                    <td><?php echo e($med->pivot->dose); ?></td>
                    <td><?php echo e($med->pivot->period); ?></td>
                </tr>
            <?php endforeach; $__env->popLoop(); $loop = $__env->getLastLoop(); ?>
        </tbody>
    </table>
</body>

</html>
<?php /**PATH C:\Users\pc cam\OneDrive\Bureau\PROJET 1CS\E-Doc\back-end\resources\views/pdf/prescription_pdf.blade.php ENDPATH**/ ?>