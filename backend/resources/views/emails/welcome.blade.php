<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Welcome to {{ config('app.name') }}</title>
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
            font-size: 24px;
            margin-bottom: 25px;
            color: #4F46E5;
            font-weight: bold;
        }

        .welcome-hero {
            text-align: center;
            margin-bottom: 30px;
        }

        .welcome-hero h1 {
            font-size: 32px;
            color: #111827;
            margin-bottom: 10px;
        }

        .info-box {
            background: #F0F9FF;
            border: 1px solid #BAE6FD;
            border-radius: 10px;
            padding: 20px;
            margin: 25px 0;
        }

        .feature-item {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }

        .feature-icon {
            font-size: 20px;
            margin-right: 15px;
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
    </style>
</head>

<body>
    <div class="container">
        <div class="email-wrapper">
            <div class="content">
                <div class="welcome-hero">
                    <h1>Welcome Aboard!</h1>
                </div>

                <div class="greeting">
                    Hello {{ $userName }},
                </div>

                <p>We're thrilled to have you join <strong>{{ config('app.name') }}</strong>! Your account has been successfully verified, and you're now ready to explore everything we have to offer.</p>

                <div class="info-box">
                    <div class="feature-item">
                        <span class="feature-icon">✅</span>
                        <span><strong>Account Verified:</strong> You now have full access.</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">🛠️</span>
                        <span><strong>Explore:</strong> Check out the latest features in your dashboard.</span>
                    </div>
                    <div class="feature-item">
                        <span class="feature-icon">🔒</span>
                        <span><strong>Secure:</strong> Your data is safe with us.</span>
                    </div>
                </div>

                <p>If you have any questions, feel free to reply to this email or visit our support center.</p>
            </div>

            <div class="footer">
                <p>&copy; {{ date('Y') }} <span class="app-name">{{ config('app.name') }}</span>. All rights reserved.</p>
                <p>Thank you for choosing us!</p>
            </div>
        </div>
    </div>
</body>

</html>
