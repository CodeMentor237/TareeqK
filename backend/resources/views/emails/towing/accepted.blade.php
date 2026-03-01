@extends('emails.layout')

@section('content')
<div class="greeting">
    Hello <strong>{{ $userName }}</strong>,
</div>

<p>Great news! A driver has accepted your towing request and is on their way to your location.</p>

<div class="info-box">
    <div class="info-item">
        <span class="info-icon">🆔</span>
        <span><strong>Tracking ID:</strong> {{ $towingRequest->tracking_id }}</span>
    </div>
    <div class="info-item">
        <span class="info-icon">👤</span>
        <span><strong>Driver Name:</strong> {{ $towingRequest->driver->name }}</span>
    </div>
    <div class="info-item">
        <span class="info-icon">🚗</span>
        <span><strong>Vehicle:</strong> {{ $towingRequest->vehicle_type }}</span>
    </div>
</div>

<div style="text-align: center;">
    <a href="{{ config('app.frontend_url') }}/track/{{ $towingRequest->tracking_id }}" class="button">Track My Request</a>
</div>
@endsection

@section('footer_note')
<p>This is a live update from your Towing Service</p>
@endsection
