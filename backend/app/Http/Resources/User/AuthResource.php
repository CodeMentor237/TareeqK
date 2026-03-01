<?php

namespace App\Http\Resources\User;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Http\Resources\User\UserResource;

class AuthResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'status' => 'success',
            'data' => array_merge(
                (new UserResource($this->resource['user']))->toArray($request),
                [
                    'access_token' => $this->resource['access_token'],
                    'refresh_token' => $this->resource['refresh_token'],
                    'token_type' => 'Bearer',
                ]
            )
        ];
    }
}
