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
            ['name' => 'doctor', 'description' => 'A medical doctor'],
            ['name' => 'admin', 'description' => 'Administrator'],
        ];

        foreach ($roles as $role) {
            Role::create($role);
        }
    }
}
