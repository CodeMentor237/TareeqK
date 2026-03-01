<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TowingRequestResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->tracking_id,
            'tracking_id' => $this->tracking_id,
            'customer_id' => $this->customer_id,
            'customer_name' => $this->customer_name,
            'customer_email' => $this->customer_email,
            'customer_phone' => $this->customer_phone,
            'vehicle_type' => $this->vehicle_type,
            'pickup' => [
                'lat' => (float) $this->pickup_lat,
                'lng' => (float) $this->pickup_lng,
                'address' => $this->pickup_address,
            ],
            'destination' => [
                'lat' => (float) $this->destination_lat,
                'lng' => (float) $this->destination_lng,
                'address' => $this->destination_address,
            ],
            'note' => $this->note,
            'status' => $this->status,
            'driver' => $this->when($this->accepted_by, function () {
                return [
                    'id' => $this->driver->id,
                    'name' => $this->driver->name,
                    'phone' => $this->driver->phone,
                    'avatar' => $this->driver->avatar,
                ];
            }),
            'logs' => RequestStatusLogResource::collection($this->whenLoaded('logs')),
            'media' => RequestMediaResource::collection($this->whenLoaded('media')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
