<?php

namespace App\Http\Controllers;

use App\Models\Screening;
use App\Models\Patient;
use Illuminate\Http\Request;

class ScreeningController extends Controller
{
    private function getValidTypesForCategory($category)
    {
        $validTypes = [
            'respiratory_diseases' => ['Asthma', 'Allergy', 'Tuberculosis', 'Pneumonia', 'Other'],
            'heart_and_vascular_diseases' => ['High blood pressure (Hypertension)', 'Acute rheumatic fever (ARF)', 'Arrhythmia (Heart rhythm disorder)'],
            'digestive_system_diseases' => ['Hepatitis', 'Crohn\'s disease', 'Celiac disease', 'Stomach ulcer (Gastric ulcer)', 'Other'],
            'endocrine_diseases' => ['Diabetes mellitus', 'Obesity', 'Diabetes insipidus', 'Hypothyroidism', 'Other'],
            'reproductive_system_diseases' => ['Ovarian cyst', 'Menstrual disorders', 'Other'],
            'blood_disorders' => ['Thalassemia', 'Sickle cell anemia (Sickle cell disease)', 'Anemia', 'Other'],
            'urinary_tract_and_kidney_diseases' => ['Urinary tract infection (UTI)', 'Kidney failure (Renal failure)', 'Other'],
            'skin_diseases' => ['Psoriasis', 'Skin rash', 'Other'],
            'ent_diseases' => ['Sinusitis', 'Tonsillitis', 'Other'],
            'eye_diseases' => ['Uveitis', 'Conjunctivitis', 'Other'],
            'neurological_and_mental_disorders' => ['Epilepsy', 'Brain tumors (Cavernoma)', 'Multiple sclerosis (MS)', 'Depression', 'Obsessive-compulsive disorder (OCD)', 'Bipolar disorder', 'Other'],
            'rheumatic_diseases' => ['Rheumatoid arthritis (RA)', 'Scoliosis', 'Systemic lupus erythematosus (Lupus)', 'Sciatica', 'Clubfoot (Talipes equinovarus)', 'Adult-onset Still\'s disease'],
            'cancers' => ['Cancer']
        ];

        return $validTypes[$category] ?? [];
    }

    public function store(Request $request, $id)
    {
        $request->validate([
            'category' => 'required|in:respiratory_diseases,heart_and_vascular_diseases,digestive_system_diseases,endocrine_diseases,reproductive_system_diseases,blood_disorders,urinary_tract_and_kidney_diseases,skin_diseases,ent_diseases,eye_diseases,neurological_and_mental_disorders,rheumatic_diseases,cancers',
        ]);

        // Validate type based on category
        $validTypes = $this->getValidTypesForCategory($request->category);
        $request->validate([
            'type' => 'required|in:' . implode(',', $validTypes),
            'result' => 'nullable|string',
        ]);

        // Check if patient exists and is archived
        $patient = Patient::findOrFail($id);
        if ($patient->is_archived) {
            return response()->json(['message' => 'Cannot add screening for archived patient'], 403);
        }

        // Add patient_id to validated data
        $validated = $request->only(['category', 'type', 'result']);
        $validated['patient_id'] = $id;

        Screening::create($validated);

        return response()->json(['message' => 'Screening created successfully.']);
    }

    public function update(Request $request, $id)
    {
        $screening = Screening::findOrFail($id);

        // Check if patient is archived
        if ($screening->patient->is_archived) {
            return response()->json(['message' => 'Cannot update screening for archived patient'], 403);
        }

        $request->validate([
            'category' => 'required|in:respiratory_diseases,heart_and_vascular_diseases,digestive_system_diseases,endocrine_diseases,reproductive_system_diseases,blood_disorders,urinary_tract_and_kidney_diseases,skin_diseases,ent_diseases,eye_diseases,neurological_and_mental_disorders,rheumatic_diseases,cancers',
        ]);

        // Validate type based on category
        $validTypes = $this->getValidTypesForCategory($request->category);
        $request->validate([
            'type' => 'required|in:' . implode(',', $validTypes),
            'result' => 'nullable|string',
        ]);

        $validated = $request->only(['category', 'type', 'result']);
        $screening->update($validated);

        return response()->json(['message' => 'Screening updated successfully.']);
    }
}
