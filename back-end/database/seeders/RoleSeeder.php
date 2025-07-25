<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $roles = [
            ['name' => 'student', 'description' => 'A student user'],
            ['name' => 'employer', 'description' => 'An employer'],
            ['name' => 'teacher', 'description' => 'A teacher'],
            ['name' => 'admin', 'description' => 'Administrator'],
            ['name' => 'doctor', 'description' => 'Doctor'],
            ['name' => 'doctor_assistant', 'description' => 'Doctor Assistant'],
        ];

        foreach ($roles as $role) {
            \App\Models\Role::updateOrCreate(
                ['name' => $role['name']],
                ['description' => $role['description']]
            );
        }
    }
}
