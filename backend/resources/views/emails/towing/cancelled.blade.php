@extends('emails.layout')

@section('content')
<div class="greeting">
    Hello Admin <strong>{{ $userName }}</strong>,
</div>

<p>A towing request has been <strong>CANCELLED</strong> and requires your attention.</p>

<div class="info-box" style="background-color: #FEF2F2; border-color: #FECACA;">
    <div class="info-item">
        <span class="info-icon">🛑</span>
        <span><strong>Status:</strong> Cancelled</span>
    </div>
    <div class="info-item">
        <span class="info-icon">🆔</span>
        <span><strong>Tracking ID:</strong> {{ $towingRequest->tracking_id }}</span>
    </div>
</div>

<p>Please review the request in the admin dashboard to take any necessary actions or to reassign it.</p>

<div style="text-align: center;">
    <a href="{{ config('app.admin_url') }}/requests?search={{ $towingRequest->tracking_id }}" class="button" style="background-color: #EF4444;">Review Request</a>
</div>
@endsection

@section('footer_note')
<p>Priority action needed for cancellation processing.</p>
@endsection
