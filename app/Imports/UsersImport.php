<?php

namespace App\Imports;

use PhpOffice\PhpSpreadsheet\Shared\Date;
use Maatwebsite\Excel\Concerns\ToModel;
use Maatwebsite\Excel\Concerns\WithHeadingRow;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class UsersImport implements ToModel, WithHeadingRow
{
    public function model(array $row)
    {
        // Supprimer ou commenter la ligne dd après avoir vérifié le contenu
        // dd($row);

        return new User([
            'name'      => $row['name'],
            'email'     => $row['email'],
            'password'  => Hash::make($row['password']),
            'role_id'   => $row['role_id'],
            'gender'    => $row['gender'],
            'birthdate' => $this->convertExcelDate($row['birthdate']),
            'phone_num' => $row['phone_num'],
            'address'   => $row['address'],
        ]);
    }

    private function convertExcelDate($value)
    {
        if (is_numeric($value)) {
            return Date::excelToDateTimeObject($value)->format('Y-m-d');
        }
        return $value; // Si c'est déjà une date au format correct
    }
}
