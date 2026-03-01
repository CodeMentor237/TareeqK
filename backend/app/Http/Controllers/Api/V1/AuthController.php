<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginUserRequest;
use App\Http\Requests\Auth\RegisterUserRequest;
use App\Http\Resources\User\AuthResource;
use App\Http\Resources\ErrorResource;
use App\Http\Resources\SuccessResource;
use App\Http\Resources\User\UserResource;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(RegisterUserRequest $request, \App\Services\OTPService $otpService)
    {
        $validated = $request->validated();

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'phone' => $validated['phone'],
            'role' => $validated['role'],
        ]);

        // Generate OTP using service
        $otpData = $otpService->generateOTP();

        try {
            // Send OTP via Email
            \App\Jobs\SendMailJob::dispatch(
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
                'message' => 'Registration successful. Please verify your email with the OTP sent to your email address.',
                'data' => [
                    'email' => $user->email,
                    'expires_in' => 10 // Minutes
                ]
            ]);
        } catch (\Exception $e) {
            // If email fails, we might still want to return a success but mention the failure, 
            // or return an error if OTP is strictly required. Here we return success but user will need to resend.
            return new SuccessResource([
                'message' => 'Registration successful, but we failed to send the verification email. Please try resending it.',
                'data' => [
                    'email' => $user->email
                ]
            ]);
        }
    }

    public function login(LoginUserRequest $request)
    {
        $validated = $request->validated();

        $user = User::where('email', $validated['email'])->first();

        if (!$user || !Hash::check($validated['password'], $user->password)) {
            return new ErrorResource([
                'message' => 'Invalid credentials',
                'status_code' => 401
            ]);
        }

        if ($user->email_verified_at === null) {
            $otpService = app(\App\Services\OTPService::class);
            $otpData = $otpService->generateOTP();
            
            $user->update([
                'otp_code' => $otpData['otp'],
                'otp_expires_at' => $otpData['otp_expires_at']
            ]);

            \App\Jobs\SendMailJob::dispatch($user->name, $user->email, $otpData['otp']);

            return new ErrorResource([
                'message' => 'Email not verified. A new OTP has been sent to your email.',
                'errors' => ['email' => $user->email],
                'status_code' => 403
            ]);
        }

        $accessToken = $user->createToken('access_token', ['access:full'], now()->addMinutes(15))->plainTextToken;
        $refreshToken = $user->createToken('refresh_token', ['issue:access'], now()->addDays(7))->plainTextToken;

        $authData = [
            'user' => $user,
            'access_token' => $accessToken,
            'refresh_token' => $refreshToken,
        ];

        return (new AuthResource($authData))
            ->toResponse($request)
            ->withCookie(
                cookie(
                    'refresh_token',
                    $refreshToken,
                    10080, // 7 days in minutes
                    null,
                    null,
                    config('app.env') === 'production',
                    true, // HttpOnly
                    false,
                    'Lax'
                )
            );
    }

    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return (new SuccessResource([
            'status' => 'success',
            'message' => 'Logged out successfully'
        ]))->toResponse($request)->withCookie(cookie()->forget('refresh_token'));
    }


//The user() function retrieves the authenticated user's profile data using their Bearer token.

    public function user(Request $request)
    {
        return new SuccessResource([
            'message' => 'User data retrieved successfully',
            'data' => new UserResource($request->user())
        ]);
    }

    public function refresh(Request $request)
    {
        // 1. Extract token from Cookie (Web) or Body/Bearer (Mobile)
        $token = $request->cookie('refresh_token') 
                ?? $request->input('refresh_token') 
                ?? $request->bearerToken();

        if (!$token) {
            return new ErrorResource([
                'message' => 'Refresh token required',
                'status_code' => 401
            ]);
        }

        // 2. Manually find and validate the token
        $accessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);

        if (!$accessToken || !$accessToken->can('issue:access')) {
            return new ErrorResource([
                'message' => 'Invalid or expired refresh token',
                'status_code' => 401
            ]);
        }

        // 3. Optional: Check if token is actually expired (if expiration is enforced)
        if ($accessToken->expires_at && $accessToken->expires_at->isPast()) {
             $accessToken->delete();
             return new ErrorResource([
                'message' => 'Refresh token expired',
                'status_code' => 401
            ]);
        }

        $user = $accessToken->tokenable;

        // 4. Rotation: Delete the old refresh token
        $accessToken->delete();

        // 5. Issue new pair
        $newAccessToken = $user->createToken('access_token', ['access:full'], now()->addMinutes(15))->plainTextToken;
        $newRefreshToken = $user->createToken('refresh_token', ['issue:access'], now()->addDays(7))->plainTextToken;

        $authData = [
            'user' => $user,
            'access_token' => $newAccessToken,
            'refresh_token' => $newRefreshToken,
        ];

        return (new AuthResource($authData))
            ->toResponse($request)
            ->withCookie(
                cookie(
                    'refresh_token',
                    $newRefreshToken,
                    10080, // 7 days in minutes
                    null,
                    null,
                    config('app.env') === 'production',
                    true, // HttpOnly
                    false,
                    'Lax'
                )
            );
    }
}
