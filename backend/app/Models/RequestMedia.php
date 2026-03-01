<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class RequestMedia extends Model
{
    protected $fillable = [
        'request_id',
        'image_path',
        'uploaded_by',
    ];

    public function request()
    {
        return $this->belongsTo(TowingRequest::class);
    }

    public function driver()
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }
}
