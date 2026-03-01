<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1 Admin
        \App\Models\User::updateOrCreate(
            ['email' => 'admin@tareeqk.com'],
            [
                'name' => 'Admin User',
                'role' => 'admin',
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        // 4 Drivers
        $drivers = \App\Models\User::factory(4)->driver()->create([
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        // 5 Customers
        $iosCustomer = \App\Models\User::updateOrCreate(
            ['email' => 'iosisceo@gmail.com'],
            [
                'name' => 'IOS CEO',
                'role' => 'customer',
                'password' => \Illuminate\Support\Facades\Hash::make('password'),
                'email_verified_at' => now(),
            ]
        );

        $customers = \App\Models\User::factory(4)->customer()->create([
            'password' => \Illuminate\Support\Facades\Hash::make('password'),
            'email_verified_at' => now(),
        ]);

        $allCustomers = $customers->concat([$iosCustomer]);

        // Seed 10 Towing Requests
        \App\Models\TowingRequest::factory(15)->create([
            'customer_id' => fn() => $allCustomers->random()->id,
            'accepted_by' => fn(array $attributes) => 
                in_array($attributes['status'], ['accepted', 'in_progress', 'completed']) 
                ? $drivers->random()->id 
                : null,
        ])->each(function ($request) {
            $baseTime = $request->created_at;
            $statuses = ['pending'];
            
            if (in_array($request->status, ['accepted', 'in_progress', 'completed'])) {
                $statuses[] = 'accepted';
            }
            if (in_array($request->status, ['in_progress', 'completed'])) {
                $statuses[] = 'in_progress';
            }
            if (in_array($request->status, ['completed', 'cancelled'])) {
                $statuses[] = $request->status;
            }

            foreach ($statuses as $index => $status) {
                $logTime = (clone $baseTime)->addMinutes($index * 15);
                $request->logs()->create([
                    'status' => $status,
                    'updated_by' => $status === 'pending' ? $request->customer_id : ($request->accepted_by ?? $request->customer_id),
                    'created_at' => $logTime,
                    'updated_at' => $logTime,
                ]);
            }
        });
    }
}
