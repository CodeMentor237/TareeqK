<?php

namespace App\Http\Requests\Customer;

use Illuminate\Foundation\Http\FormRequest;

class StoreTowingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $isGuest = !auth('sanctum')->check();

        return [
            'customer_name' => $isGuest ? 'required|string|max:255' : 'nullable|string|max:255',
            'customer_email' => $isGuest ? 'required|email|max:255' : 'nullable|email|max:255',
            'customer_phone' => $isGuest ? 'required|string|max:20' : 'nullable|string|max:20',
            'vehicle_type' => 'required|string|in:car,suv,truck,motorcycle,other',
            'pickup_lat' => 'required|numeric|between:-90,90',
            'pickup_lng' => 'required|numeric|between:-180,180',
            'pickup_address' => 'nullable|string|max:500',
            'destination_lat' => 'nullable|numeric|between:-90,90',
            'destination_lng' => 'nullable|numeric|between:-180,180',
            'destination_address' => 'nullable|string|max:500',
            'note' => 'nullable|string|max:1000',
        ];
    }
}
