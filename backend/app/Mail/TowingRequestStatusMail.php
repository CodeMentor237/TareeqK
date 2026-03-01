<?php

namespace App\Mail;

use App\Models\TowingRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class TowingRequestStatusMail extends Mailable
{
    use Queueable, SerializesModels;

    public $towingRequest;
    public $type;
    public $userName;

    /**
     * Create a new message instance.
     */
    public function __construct(TowingRequest $towingRequest, string $type, string $userName)
    {
        $this->towingRequest = $towingRequest;
        $this->type = $type;
        $this->userName = $userName;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        $subjects = [
            'accepted' => 'Driver Assigned - ' . config('app.name'),
            'ongoing' => 'Towing in Progress - ' . config('app.name'),
            'completed' => 'Towing Completed - ' . config('app.name'),
            'cancelled' => 'ACTION REQUIRED: Request Cancelled - ' . config('app.name'),
        ];

        return new Envelope(
            subject: $subjects[$this->type] ?? 'Request Update - ' . config('app.name'),
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.towing.' . $this->type,
            with: [
                'towingRequest' => $this->towingRequest,
                'userName' => $this->userName,
            ],
        );
    }
}
