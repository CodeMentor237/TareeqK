<?php

namespace Database\Factories;

use App\Models\TowingRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TowingRequest>
 */
class TowingRequestFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $pickupLat = 33.3152; // Baghdad center
        $pickupLng = 44.3661;
        
        return [
            'tracking_id' => 'TK' . strtoupper(\Illuminate\Support\Str::random(8)),
            'customer_id' => User::factory(),
            'customer_name' => fake()->name(),
            'customer_email' => fake()->safeEmail(),
            'customer_phone' => fake()->phoneNumber(),
            'vehicle_type' => fake()->randomElement(['sedan', 'suv', 'truck', 'motorcycle']),
            'pickup_lat' => $pickupLat + (fake()->latitude(-0.1, 0.1)),
            'pickup_lng' => $pickupLng + (fake()->longitude(-0.1, 0.1)),
            'pickup_address' => fake()->address(),
            'destination_lat' => $pickupLat + (fake()->latitude(-0.1, 0.1)),
            'destination_lng' => $pickupLng + (fake()->longitude(-0.1, 0.1)),
            'destination_address' => fake()->address(),
            'note' => fake()->sentence(),
            'status' => fake()->randomElement(['pending', 'accepted', 'ongoing', 'completed', 'cancelled']),
            'accepted_by' => null,
        ];
    }

    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'pending',
            'accepted_by' => null,
        ]);
    }

    public function accepted(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'accepted',
            'accepted_by' => User::factory()->driver(),
        ]);
    }
}
