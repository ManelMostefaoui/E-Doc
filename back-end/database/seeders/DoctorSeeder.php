<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Hash;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;


class DoctorSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $doctorRole = Role::where('name', 'doctor')->first();
        User::updateOrCreate(
            ['email' => 'doctor@esi-sba.dz'],
            [
                'name' => 'doctor',
                'password' => Hash::make('doctor@@esi-sba.2025'),
                'role_id' => $doctorRole->id,
                'gender' => 'Female',
                'birthdate' => '2000-01-01',
                'phone_num' => '056209318',
                'address' => 'Sidi belAbess'
            ]
        );
    }
}
