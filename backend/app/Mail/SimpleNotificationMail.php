<?php

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class SimpleNotificationMail extends Mailable
{
    use Queueable, SerializesModels;

    public $userName;
    public $messageText;
    public $actionUrl;
    public $actionText;
    public $subjectLine;

    /**
     * Create a new message instance.
     */
    public function __construct($messageText, $userName = null, $actionUrl = null, $actionText = null, $subjectLine = null)
    {
        $this->messageText = $messageText;
        $this->userName = $userName;
        $this->actionUrl = $actionUrl;
        $this->actionText = $actionText;
        $this->subjectLine = $subjectLine;
    }

    /**
     * Get the message envelope.
     */
    public function envelope(): Envelope
    {
        return new Envelope(
            subject: $this->subjectLine ?? config('app.name') . ' Notification',
        );
    }

    /**
     * Get the message content definition.
     */
    public function content(): Content
    {
        return new Content(
            view: 'emails.notification',
            with: [
                'userName' => $this->userName,
                'messageText' => $this->messageText,
                'actionUrl' => $this->actionUrl,
                'actionText' => $this->actionText,
            ],
        );
    }
}
