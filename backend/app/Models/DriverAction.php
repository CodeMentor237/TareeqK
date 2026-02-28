<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DriverAction extends Model
{
    protected $fillable = [
        'request_id',
        'driver_id',
        'action',
    ];

    public function request()
    {
        return $this->belongsTo(TowingRequest::class);
    }

    public function driver()
    {
        return $this->belongsTo(User::class, 'driver_id');
    }
}
