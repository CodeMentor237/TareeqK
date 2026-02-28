<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TowingRequest extends Model
{
    protected $fillable = [
        'tracking_id',
        'customer_id',
        'customer_name',
        'customer_email',
        'customer_phone',
        'vehicle_type',
        'pickup_lat',
        'pickup_lng',
        'pickup_address',
        'destination_lat',
        'destination_lng',
        'destination_address',
        'note',
        'status',
        'accepted_by',
    ];

    protected static function booted()
    {
        static::creating(function ($towingRequest) {
            $towingRequest->tracking_id = self::generateUniqueTrackingId();
        });
    }

    private static function generateUniqueTrackingId()
    {
        do {
            $trackingId = 'TK' . strtoupper(\Illuminate\Support\Str::random(8));
        } while (self::where('tracking_id', $trackingId)->exists());

        return $trackingId;
    }

    public function getRouteKeyName()
    {
        return 'tracking_id';
    }

    public function customer()
    {
        return $this->belongsTo(User::class, 'customer_id');
    }

    public function driver()
    {
        return $this->belongsTo(User::class, 'accepted_by');
    }

    public function logs()
    {
        return $this->hasMany(RequestStatusLog::class, 'request_id');
    }

    public function media()
    {
        return $this->hasMany(RequestMedia::class, 'request_id');
    }

    public function actions()
    {
        return $this->hasMany(DriverAction::class, 'request_id');
    }
}
