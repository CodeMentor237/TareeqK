<?php

namespace App\Jobs;

use App\Mail\TowingRequestStatusMail;
use App\Models\TowingRequest;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

class SendTowingStatusEmailJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected $towingRequest;
    protected $type;
    protected $recipientEmail;
    protected $userName;

    /**
     * Create a new job instance.
     */
    public function __construct(TowingRequest $towingRequest, string $type, string $recipientEmail, string $userName)
    {
        $this->towingRequest = $towingRequest;
        $this->type = $type;
        $this->recipientEmail = $recipientEmail;
        $this->userName = $userName;
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        Mail::to($this->recipientEmail)->send(new TowingRequestStatusMail(
            $this->towingRequest,
            $this->type,
            $this->userName
        ));
    }

    /**
     * Handle job failure.
     */
    public function failed(\Throwable $exception): void
    {
        Log::error('SendTowingStatusEmailJob failed: ' . $exception->getMessage(), [
            'request_id' => $this->towingRequest->id,
            'type' => $this->type
        ]);
    }
}
