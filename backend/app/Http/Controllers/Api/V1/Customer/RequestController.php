<?php

namespace App\Http\Controllers\Api\V1\Customer;

use App\Http\Controllers\Controller;
use App\Http\Requests\Customer\StoreTowingRequest;
use App\Http\Resources\TowingRequestResource;
use App\Http\Resources\PublicTowingRequestResource;
use App\Http\Resources\SuccessResource;
use App\Http\Resources\ErrorResource;
use App\Models\TowingRequest;
use App\Models\User;
use App\Jobs\SendTowingStatusEmailJob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

class RequestController extends Controller
{
    public function index(Request $request)
    {
        $requests = $request->user()->requests()
            ->with(['driver', 'logs'])
            ->latest()
            ->paginate(10);

        return TowingRequestResource::collection($requests);
    }

    public function track($id)
    {
        $towingRequest = TowingRequest::with(['driver', 'logs.user'])
            ->where('tracking_id', $id)
            ->first();

        if (!$towingRequest) {
            return new ErrorResource([
                'message' => 'Request not found',
                'status_code' => 404
            ]);
        }

        return new SuccessResource([
            'message' => 'Request details retrieved successfully',
            'data' => new PublicTowingRequestResource($towingRequest)
        ]);
    }

    public function store(StoreTowingRequest $request)
    {
        return DB::transaction(function () use ($request) {
            $user = auth('sanctum')->user();
            $data = $request->validated();

            if ($user) {
                $data['customer_id'] = $user->id;
                $data['customer_name'] = $user->name;
                $data['customer_email'] = $user->email;
                $data['customer_phone'] = $user->phone;
            }

            $data['status'] = 'pending';

            $towingRequest = TowingRequest::create($data);

            $towingRequest->logs()->create([
                'status' => 'pending',
                'updated_by' => $user ? $user->id : null,
            ]);

            return new SuccessResource([
                'message' => 'Towing request created successfully',
                'data' => new TowingRequestResource($towingRequest->load(['driver', 'logs']))
            ]);
        });
    }

    public function show(Request $request, $id)
    {
        $towingRequest = $request->user()->requests()
            ->with(['driver', 'logs.user'])
            ->where('tracking_id', $id)
            ->first();

        if (!$towingRequest) {
            return new SuccessResource([
                'message' => 'Request not found',
                'data' => null
            ]);
        }

        return new SuccessResource([
            'message' => 'Request details retrieved successfully',
            'data' => new TowingRequestResource($towingRequest)
        ]);
    }

    public function cancel(Request $request, $id)
    {
        return DB::transaction(function () use ($request, $id) {
            $towingRequest = $request->user()->requests()
                ->where('tracking_id', $id)
                ->first();

            if (!$towingRequest) {
                return new SuccessResource([
                    'message' => 'Request not found',
                    'data' => null
                ]);
            }

            if (!in_array($towingRequest->status, ['pending', 'accepted'])) {
                return new ErrorResource([
                    'message' => 'Request cannot be cancelled at this stage',
                    'status_code' => 422
                ]);
            }

            $towingRequest->update(['status' => 'cancelled']);

            $towingRequest->logs()->create([
                'status' => 'cancelled',
                'updated_by' => $request->user()->id,
            ]);

            if ($towingRequest->accepted_by) {
                $towingRequest->driver->update(['is_available' => true]);
            }

            // Send email to the first admin via queue
            $admin = User::where('role', 'admin')->first();
            if ($admin) {
                SendTowingStatusEmailJob::dispatch($towingRequest, 'cancelled', $admin->email, $admin->name);
            }

            return new SuccessResource([
                'message' => 'Request cancelled successfully',
                'data' => new TowingRequestResource($towingRequest->load(['driver', 'logs']))
            ]);
        });
    }
}
