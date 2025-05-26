<?php

namespace App\Http\Controllers;

use App\Models\Medication;
use App\Models\Prescription;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;

class PrespectionController extends Controller
{
    public function store(Request $request)
    {
        $prescription = Prescription::create([
            'date' => $request->date,
            'full_name' => $request->full_name,
            'age' => $request->age,
        ]);

        $syncData = [];

        foreach ($request->medications as $med) {
            $medication = Medication::where('name', $med['name'])->first();

            if (!$medication) {
                return response()->json([
                    'message' => "Medication '{$med['name']}' does not exist in the database."
                ], 422);
            }

            $syncData[$medication->id] = [
                'dose' => $med['dose'],
                'period' => $med['period'],
            ];
        }


        $prescription->medications()->sync($syncData);

        return response()->json([
            'message' => 'Prescription saved successfully',
            'prescription_id' => $prescription->id
        ], 201);
    }

    public function show($id)
    {
        $prescription = Prescription::with('medications')->findOrFail($id);

        return response()->json($prescription);
    }
    public function update(Request $request, $id)
    {
        $prescription = Prescription::findOrFail($id);
        $prescription->update([
            'date' => $request->date,
            'full_name' => $request->full_name,
            'age' => $request->age,
        ]);

        $syncData = [];

        foreach ($request->medications as $med) {
            $medication = Medication::where('name', $med['name'])->first();

            if ($medication) {
                $syncData[$medication->id] = [
                    'dose' => $med['dose'],
                    'period' => $med['period'],
                ];
            }
        }

        $prescription->medications()->sync($syncData);

        return response()->json([
            'message' => 'Prescription updated successfully',
            'prescription_id' => $prescription->id
        ]);
    }




    public function generateReport($id)
    {
        $prescription = Prescription::with('medications')->findOrFail($id);

        $pdf = Pdf::loadView('pdf.prescription_pdf', compact('prescription'));

        return $pdf->download('prescription_' . $prescription->id . '.pdf');
    }
}
