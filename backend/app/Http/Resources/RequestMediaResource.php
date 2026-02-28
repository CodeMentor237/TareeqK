<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RequestMediaResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'url' => \Illuminate\Support\Facades\Storage::disk('public')->url($this->image_path),
            'uploaded_by' => $this->driver->name,
            'timestamp' => $this->created_at,
        ];
    }
}
