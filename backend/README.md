# TareeqK Backend API

The backend for TareeqK, a professional towing and roadside assistance service platform. This API handles authentication, request management, driver assignment, and administrative tasks.

## Tech Stack

- **PHP**: ^8.2
- **Framework**: Laravel 12.0
- **Database**: MySQL
- **Authentication**: Laravel Sanctum (Token-based)

## Getting Started

### Prerequisites

- PHP 8.2 or higher
- Composer
- MySQL

### Installation

1. **Clone the repository** (if not already done) and navigate to the backend directory:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   composer install
   ```

3. **Environment Setup**:
   Copy the example environment file and configure your database:
   ```bash
   cp .env.example .env
   ```
   *Note: By default, it uses MySQL. Ensure MySQL is running.*

4. **Generate Application Key**:
   ```bash
   php artisan key:generate
   ```

5. **Run Migrations**:
   ```bash
   php artisan migrate
   ```

6. **Run Seeders**:
   ```bash
   php artisan db:seed
   ```

## Running the Application

To start the local development server:

```bash
php artisan serve
```

The API will be accessible at `http://localhost:8000`.

## API Endpoints

### Authentication (`/api/v1/auth`)
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/register` | Register a new user |
| POST | `/login` | Authenticate and get tokens |
| POST | `/send-otp` | Send One-Time Password |
| POST | `/verify-otp` | Verify OTP for login/verification |
| POST | `/refresh` | Refresh access token |
| DELETE | `/logout` | Invalidate current token (Auth required) |
| GET | `/user` | Get authenticated user profile (Auth required) |

### Customer Portal (`/api/v1/customer`)
*Requires `auth:sanctum` and `customer` role.*
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/v1/requests` | Create a new towing request (Guest/Public) |
| GET | `/v1/requests/track/{id}` | Track a request by ID (Guest/Public) |
| GET | `/requests` | List customer's own requests |
| GET | `/requests/{id}` | Get specific request details |
| POST | `/requests/{id}/cancel` | Cancel a pending request |

### Driver Portal (`/api/v1/driver`)
*Requires `auth:sanctum` and `driver` role.*
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/availability` | Toggle driver availability |
| GET | `/requests/available` | List nearby available requests |
| GET | `/requests/current` | Get current active assignment |
| GET | `/requests/history` | List driver's completed requests |
| POST | `/requests/{id}/accept` | Accept a towing request |
| POST | `/requests/{id}/decline` | Decline a towing request |
| POST | `/requests/{id}/status` | Update status of an active request |

### Admin Portal (`/api/v1/admin`)
*Requires `auth:sanctum` and `admin` role.*
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/dashboard` | Get administrative overview statistics |
| GET | `/requests` | List all requests in the system |
| POST | `/requests/{id}/reassign` | Reassign a request to another driver |
| GET | `/users` | List all registered users |

## License

The Laravel framework is open-sourced software licensed under the [MIT license](https://opensource.org/licenses/MIT).

