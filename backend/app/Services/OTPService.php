<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Carbon;

class OTPService
{
    /**
     * Generate a random OTP and set expiration time.
     *
     * @return array
     */
    public function generateOTP(): array
    {
        return [
            'otp' => rand(100000, 999999),
            'otp_expires_at' => Carbon::now()->addMinutes(10)
        ];
    }

    /**
     * Verify OTP and return user if valid.
     *
     * @param string $email
     * @param string $otp
     * @return ?User
     */
    public function verifyOTP(string $email, string $otp): ?User
    {
        return User::where('email', $email)
            ->where('otp_code', $otp)
            ->where('otp_expires_at', '>', Carbon::now())
            ->first();
    }

    /**
     * Verify OTP and mark email as verified.
     *
     * @param string $email
     * @param string $otp
     * @return ?User
     */
    public function verifyOTPAndVerifyEmail(string $email, string $otp): ?User
    {
        $user = $this->verifyOTP($email, $otp);

        if ($user) {
            $user->update([
                'otp_code' => null,
                'otp_expires_at' => null,
                'email_verified_at' => Carbon::now()
            ]);
        }

        return $user;
    }

    /**
     * Verify OTP and mark phone as verified.
     *
     * @param string $phone
     * @param string $otp
     * @return ?User
     */
    public function verifyOTPAndVerifyPhone(string $phone, string $otp): ?User
    {
        $user = $this->verifyOTP($phone, $otp);

        if ($user) {
            $user->update([
                'otp_code' => null,
                'otp_expires_at' => null,
                'phone_verified_at' => Carbon::now()
            ]);
        }

        return $user;
    }

    /**
     * Clear OTP from user record.
     *
     * @param User $user
     * @return void
     */
    public function clearOTP(User $user): void
    {
        $user->update([
            'otp_code' => null,
            'otp_expires_at' => null,
        ]);
    }
}
