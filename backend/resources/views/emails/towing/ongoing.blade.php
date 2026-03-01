@extends('emails.layout')

@section('content')
<div class="greeting">
    Hello <strong>{{ $userName }}</strong>,
</div>

<p>Your vehicle is now being towed. Your driver has started the journey to the destination.</p>

<div class="info-box">
    <div class="info-item">
        <span class="info-icon">🆔</span>
        <span><strong>Tracking ID:</strong> {{ $towingRequest->tracking_id }}</span>
    </div>
    <div class="info-item">
        <span class="info-icon">📍</span>
        <span><strong>Destination:</strong> {{ $towingRequest->destination_address }}</span>
    </div>
</div>

<div style="text-align: center;">
    <a href="{{ config('app.frontend_url') }}/track/{{ $towingRequest->tracking_id }}" class="button">Track Live Progress</a>
</div>
@endsection

@section('footer_note')
<p>Safety is our priority. Your vehicle is in good hands.</p>
@endsection
