<?php

namespace App\Http\Controllers;

use App\Models\Screening;
use App\Models\Patient;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

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
            'screenings' => 'required|array',
            'screenings.*.category' => 'required|in:respiratory_diseases,heart_and_vascular_diseases,digestive_system_diseases,endocrine_diseases,reproductive_system_diseases,blood_disorders,urinary_tract_and_kidney_diseases,skin_diseases,ent_diseases,eye_diseases,neurological_and_mental_disorders,rheumatic_diseases,cancers',
        ]);

        // Check if patient exists and is archived
        $patient = Patient::findOrFail($id);
        if ($patient->is_archived) {
            return response()->json(['message' => 'Cannot add screening for archived patient'], 403);
        }

        $screenings = [];
        foreach ($request->screenings as $screening) {
            // Validate type based on category
            $validTypes = $this->getValidTypesForCategory($screening['category']);

            // Validate each screening's type
            $validator = validator($screening, [
                'type' => 'required|in:' . implode(',', $validTypes),
                'result' => 'nullable|string',
            ]);

            if ($validator->fails()) {
                return response()->json(['errors' => $validator->errors()], 422);
            }

            $screenings[] = [
                'category' => $screening['category'],
                'type' => $screening['type'],
                'result' => $screening['result'] ?? null,
                'patient_id' => $id
            ];
        }

        // Create all screenings
        Screening::insert($screenings);

        return response()->json(['message' => 'Screenings created successfully.']);
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

    public function getStatistics(Request $request)
    {
        $statistics = [
            'total_screenings' => Screening::count(),
            'by_category' => [],
            'by_type' => [],
            'trend' => []
        ];

        // Get statistics by category
        $categoryStats = Screening::select('category', DB::raw('count(*) as total'))
            ->groupBy('category')
            ->get();

        foreach ($categoryStats as $stat) {
            $statistics['by_category'][$stat->category] = [
                'total' => $stat->total,
                'percentage' => round(($stat->total / $statistics['total_screenings']) * 100, 2)
            ];

            // Get type distribution for each category
            $typeStats = Screening::select('type', DB::raw('count(*) as total'))
                ->where('category', $stat->category)
                ->groupBy('type')
                ->get();

            $statistics['by_category'][$stat->category]['types'] = [];
            foreach ($typeStats as $typeStat) {
                $statistics['by_category'][$stat->category]['types'][$typeStat->type] = [
                    'total' => $typeStat->total,
                    'percentage' => round(($typeStat->total / $stat->total) * 100, 2)
                ];
            }
        }

        // Get monthly trend for the past 12 months
        $trend = Screening::select(
            DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
            'category',
            DB::raw('count(*) as total')
        )
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('month', 'category')
            ->orderBy('month')
            ->get();

        $trendByMonth = [];
        foreach ($trend as $record) {
            if (!isset($trendByMonth[$record->month])) {
                $trendByMonth[$record->month] = [];
            }
            $trendByMonth[$record->month][$record->category] = $record->total;
        }
        $statistics['trend'] = $trendByMonth;

        return response()->json($statistics);
    }

    public function getCategoryStatistics(Request $request, $category)
    {
        $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date'
        ]);

        $query = Screening::where('category', $category);

        if ($request->has('start_date')) {
            $query->where('created_at', '>=', $request->start_date);
        }
        if ($request->has('end_date')) {
            $query->where('created_at', '<=', $request->end_date);
        }

        $statistics = [
            'total' => $query->count(),
            'by_type' => [],
            'monthly_trend' => [],
            'patient_demographics' => []
        ];

        // Get statistics by type
        $typeStats = $query->select('type', DB::raw('count(*) as total'))
            ->groupBy('type')
            ->get();

        foreach ($typeStats as $stat) {
            $statistics['by_type'][$stat->type] = [
                'total' => $stat->total,
                'percentage' => round(($stat->total / $statistics['total']) * 100, 2)
            ];
        }

        // Get monthly trend
        $trend = $query->select(
            DB::raw('DATE_FORMAT(created_at, "%Y-%m") as month'),
            DB::raw('count(*) as total')
        )
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        foreach ($trend as $record) {
            $statistics['monthly_trend'][$record->month] = $record->total;
        }

        // Get patient demographics
        $demographics = $query->join('patients', 'screenings.patient_id', '=', 'patients.id')
            ->select(
                DB::raw('COUNT(DISTINCT screenings.patient_id) as unique_patients'),
                DB::raw('AVG(TIMESTAMPDIFF(YEAR, patients.date_of_birth, CURDATE())) as avg_age'),
                DB::raw('patients.gender, COUNT(*) as total')
            )
            ->groupBy('patients.gender')
            ->get();

        $statistics['patient_demographics'] = [
            'unique_patients' => $demographics->first()->unique_patients,
            'average_age' => round($demographics->first()->avg_age, 1),
            'gender_distribution' => []
        ];

        foreach ($demographics as $demo) {
            $statistics['patient_demographics']['gender_distribution'][$demo->gender] = [
                'total' => $demo->total,
                'percentage' => round(($demo->total / $statistics['total']) * 100, 2)
            ];
        }

        return response()->json($statistics);
    }

    public function getPatientScreenings($patientId)
    {
        $screenings = Screening::where('patient_id', $patientId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($screenings);
    }
}
