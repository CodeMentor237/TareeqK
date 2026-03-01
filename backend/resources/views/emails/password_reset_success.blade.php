<!DOCTYPE html>
<html>

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Password Reset Successful - {{ config('app.name') }}</title>
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

        .status-icon {
            text-align: center;
            font-size: 64px;
            margin-bottom: 20px;
        }

        .greeting {
            font-size: 18px;
            margin-bottom: 25px;
            color: #4B5563;
        }

        .success-box {
            background: #F0FDF4;
            border: 1px solid #BBF7D0;
            border-radius: 10px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
            color: #166534;
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
                <div class="status-icon">🔒</div>
                
                <div class="greeting">
                    Hello {{ $userName }},
                </div>

                <div class="success-box">
                    <strong>Success! Your password has been changed.</strong>
                </div>

                <p>This is a confirmation that the password for your <strong>{{ config('app.name') }}</strong> account was recently updated.</p>
                
                <p style="margin-top: 20px;">If you did not perform this action, please contact our support team immediately to secure your account.</p>
            </div>

            <div class="footer">
                <p>&copy; {{ date('Y') }} <span class="app-name">{{ config('app.name') }}</span>. All rights reserved.</p>
                <p>Security Notification</p>
            </div>
        </div>
    </div>
</body>

</html>
