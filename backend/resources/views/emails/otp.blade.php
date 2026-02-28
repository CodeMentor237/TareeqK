<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>OTP Verification - {{ config('app.name') }}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }

        .container {
            max-width: 500px;
            margin: 0 auto;
        }

        .email-wrapper {
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .content {
            padding: 40px 30px;
        }

        .greeting {
            font-size: 18px;
            margin-bottom: 25px;
            color: #4B5563;
        }

        .otp-container {
            text-align: center;
            margin: 30px 0;
        }

        .otp-label {
            font-size: 16px;
            color: #6B7280;
            margin-bottom: 15px;
        }

        .otp-code {
            font-size: 48px;
            font-weight: bold;
            color: #4F46E5;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            background: #F8FAFC;
            padding: 20px;
            border-radius: 10px;
            border: 2px dashed #E5E7EB;
            margin: 15px 0;
        }

        .info-box {
            background: #F0F9FF;
            border: 1px solid #BAE6FD;
            border-radius: 10px;
            padding: 20px;
            margin: 25px 0;
        }

        .info-item {
            display: flex;
            align-items: center;
            margin-bottom: 10px;
        }

        .info-item:last-child {
            margin-bottom: 0;
        }

        .info-icon {
            font-size: 18px;
            margin-right: 12px;
        }

        .footer {
            text-align: center;
            padding: 30px;
            background: #F8FAFC;
            border-top: 1px solid #E5E7EB;
        }

        .footer p {
            color: #6B7280;
            font-size: 14px;
            margin-bottom: 5px;
        }

        .app-name {
            color: #4F46E5;
            font-weight: 600;
        }

        @media (max-width: 600px) {
            .content {
                padding: 30px 20px;
            }

            .otp-code {
                font-size: 36px;
                letter-spacing: 6px;
                padding: 15px;
            }

        }
    </style>
</head>

<body>
    <div class="container">
        <div class="email-wrapper">
            <div class="content">
                <div class="greeting">
                    @if ($userName)
                        Hello <strong>{{ $userName }}</strong>,
                    @else
                        Hello,
                    @endif
                </div>

                <p>You're just one step away! Use the following verification code to complete your request:</p>

                <div class="otp-container">
                    <div class="otp-label">Your verification code:</div>
                    <div class="otp-code">{{ $otp }}</div>
                </div>

                <div class="info-box">
                    <div class="info-item">
                        <span class="info-icon">⏰</span>
                        <span><strong>Expires in:</strong> {{ $expiresIn }} minutes</span>
                    </div>
                    <div class="info-item">
                        <span class="info-icon">🚀</span>
                        <span><strong>Purpose:</strong>
                            @if ($purpose === 'verification')
                                Account Verification
                            @elseif($purpose === 'password_reset')
                                Password Reset
                            @elseif($purpose === 'login')
                                Login Verification
                            @else
                                Security Verification
                            @endif
                        </span>
                    </div>
                </div>
            </div>

            <div class="footer">
                <p>&copy; {{ date('Y') }} <span class="app-name">{{ config('app.name') }}</span>. All rights
                    reserved.</p>
                <p>This email was sent via Secure OTP System</p>
            </div>
        </div>
    </div>
</body>

</html>
