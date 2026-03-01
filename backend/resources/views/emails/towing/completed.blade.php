@extends('emails.layout')

@section('content')
<div class="greeting">
    Hello <strong>{{ $userName }}</strong>,
</div>

<p>Your towing request has been completed successfully. We hope you are satisfied with our service!</p>

<div class="info-box">
    <div class="info-item">
        <span class="info-icon">🎁</span>
        <span><strong>Status:</strong> Successfully Delivered</span>
    </div>
    <div class="info-item">
        <span class="info-icon">🆔</span>
        <span><strong>Tracking ID:</strong> {{ $towingRequest->tracking_id }}</span>
    </div>
</div>

<p>Thank you for choosing <strong>{{ config('app.name') }}</strong>. We're always here to help when you need us.</p>
@endsection

@section('footer_note')
<p>Thank you for your business!</p>
@endsection
