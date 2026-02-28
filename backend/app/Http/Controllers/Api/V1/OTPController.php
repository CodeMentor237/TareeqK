<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;

use App\Http\Requests\Auth\SendOTPRequest;
use App\Http\Requests\Auth\VerifyOTPRequest;
use App\Http\Resources\ErrorResource;
use App\Http\Resources\SuccessResource;
use App\Jobs\SendMailJob;
use App\Jobs\SendWelcomeMailJob;
use App\Models\User;
use App\Services\OTPService;

class OTPController extends Controller
{

    protected $otpService;

    public function __construct(OTPService $otpService)
    {
        $this->otpService = $otpService;
    }

    public function sendOTP(SendOTPRequest $request)
    {
        $validated = $request->validated();

        $user = User::where('email', $validated['email'])->first();

        // Generate OTP using service
        $otpData = $this->otpService->generateOTP();

        try {
            // Send OTP via Email
            SendMailJob::dispatch(
                $user->name,
                $user->email,
                $otpData['otp']
            );


            // Update user with OTP data
            $user->update([
                'otp_code' => $otpData['otp'],
                'otp_expires_at' => $otpData['otp_expires_at']
            ]);


            return new SuccessResource([
                'message' => 'OTP sent successfully to your email',
                'data' => [
                    'expires_in' => 10,
                    'email' => $user->email
                ]
            ]);
        } catch (\Exception $e) {
            return new ErrorResource([
                'message' => 'Failed to send OTP. Please try again.',
                'error_code' => 'EMAIL_SEND_FAILED',
                'status_code' => 500
            ]);
        }
    }


    public function verifyOTP(VerifyOTPRequest $request)
    {
        $validated = $request->validated();

         // Use email verification method for OTP verification
        $user = $this->otpService->verifyOTPAndVerifyEmail(
              $validated['email'],
              $validated['otp_code']
          );

        if (!$user) {
            return new ErrorResource([
                'message' => 'Invalid or expired OTP',
                'status_code' => 400
            ]);
        }

        // Clear OTP and mark email as verified
        $this->otpService->clearOTP($user);

        // Send Welcome Mail
        SendWelcomeMailJob::dispatch($user->name, $user->email);

        return new SuccessResource([
            'message' => 'OTP verified successfully'
        ]);
    }
}
