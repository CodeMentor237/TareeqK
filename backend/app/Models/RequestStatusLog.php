<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RequestStatusLog extends Model
{
    protected $fillable = [
        'request_id',
        'status',
        'updated_by',
    ];

    public function request()
    {
        return $this->belongsTo(TowingRequest::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'updated_by');
    }
}
