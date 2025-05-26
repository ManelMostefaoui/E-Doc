<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <title>Prescription #{{ $prescription->id }}</title>
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
        <p><strong>Full Name:</strong> {{ $prescription->full_name }}</p>
        <p><strong>Age:</strong> {{ $prescription->age }}</p>
        <p><strong>Date:</strong> {{ $prescription->date }}</p>
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
            @foreach ($prescription->medications as $med)
                <tr>
                    <td>{{ $med->name }}</td>
                    <td>{{ $med->pivot->dose }}</td>
                    <td>{{ $med->pivot->period }}</td>
                </tr>
            @endforeach
        </tbody>
    </table>
</body>

</html>
