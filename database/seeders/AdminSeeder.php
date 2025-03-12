<?php

namespace Database\Seeders;

use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        $adminRole = Role::where('name', 'admin')->first();

        User::updateOrCreate(
            ['email' => 'admin@esi-sba.dz'],
            [
                'name' => 'Admin',
                'password' => Hash::make('Adminesisba..2025'),
                'role_id' => $adminRole->id,
                'birthdate' => '2000-01-01',
                'phone_num' => '056209318',
                'address' => 'Sidi belAbess'
            ]
        );
    }
}
