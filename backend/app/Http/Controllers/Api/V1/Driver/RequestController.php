<?php

namespace App\Http\Controllers\Api\V1\Driver;

use App\Http\Controllers\Controller;
use App\Http\Requests\Driver\UpdateStatusRequest;
use App\Http\Resources\TowingRequestResource;
use App\Http\Resources\SuccessResource;
use App\Http\Resources\ErrorResource;
use App\Models\TowingRequest;
use App\Models\DriverAction;
use App\Models\RequestStatusLog;
use App\Models\RequestMedia;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Mail;
use App\Jobs\SendTowingStatusEmailJob;

class RequestController extends Controller
{
    public function toggleAvailability(Request $request)
    {
        $user = $request->user();
        $user->update(['is_available' => !$user->is_available]);

        return new SuccessResource([
            'message' => $user->is_available ? 'You are now online' : 'You are now offline',
            'data' => ['is_available' => $user->is_available]
        ]);
    }

    public function available(Request $request)
    {
        $declinedIds = DriverAction::where('driver_id', $request->user()->id)
            ->where('action', 'declined')
            ->pluck('request_id');

        $requests = TowingRequest::where('status', 'pending')
            ->whereNotIn('id', $declinedIds)
            ->with(['customer', 'logs'])
            ->latest()
            ->paginate(10);

        return TowingRequestResource::collection($requests);
    }

    public function accept(Request $request, $id)
    {
        return DB::transaction(function () use ($request, $id) {
            $towingRequest = TowingRequest::where('tracking_id', $id)
                ->where('status', 'pending')
                ->lockForUpdate()
                ->first();

            if (!$towingRequest) {
                return new SuccessResource([
                    'message' => 'Request not found or no longer available',
                    'data' => null
                ]);
            }

            if (!$request->user()->is_available) {
                return new ErrorResource([
                    'message' => 'You are currently busy with another request',
                    'status_code' => 422
                ]);
            }

            $towingRequest->update([
                'status' => 'accepted',
                'accepted_by' => $request->user()->id
            ]);

            $towingRequest->logs()->create([
                'status' => 'accepted',
                'updated_by' => $request->user()->id
            ]);

            $request->user()->update(['is_available' => false]);

            // Send email to customer via queue
            if ($towingRequest->customer_email) {
                SendTowingStatusEmailJob::dispatch($towingRequest, 'accepted', $towingRequest->customer_email, $towingRequest->customer_name);
            }

            return new SuccessResource([
                'message' => 'Request accepted successfully',
                'data' => new TowingRequestResource($towingRequest->load(['customer', 'logs']))
            ]);
        });
    }

    public function decline(Request $request, $id)
    {
        $towingRequest = TowingRequest::where('tracking_id', $id)->first();

        if (!$towingRequest) {
            return new SuccessResource([
                'message' => 'Request not found',
                'data' => null
            ]);
        }

        DriverAction::create([
            'request_id' => $towingRequest->id,
            'driver_id' => $request->user()->id,
            'action' => 'declined'
        ]);

        return new SuccessResource([
            'message' => 'Request declined'
        ]);
    }

    public function updateStatus(UpdateStatusRequest $request, $id)
    {
        return DB::transaction(function () use ($request, $id) {
            $towingRequest = TowingRequest::where('tracking_id', $id)
                ->where('accepted_by', $request->user()->id)
                ->first();

            if (!$towingRequest) {
                return new SuccessResource([
                    'message' => 'Request not found or not assigned to you',
                    'data' => null
                ]);
            }

            $newStatus = $request->status;

            // Simple transition validation
            if ($towingRequest->status === 'accepted' && $newStatus !== 'in_progress') {
                return new ErrorResource(['message' => 'Invalid status transition', 'status_code' => 422]);
            }
            if ($towingRequest->status === 'in_progress' && $newStatus !== 'completed') {
                return new ErrorResource(['message' => 'Invalid status transition', 'status_code' => 422]);
            }

            $towingRequest->update(['status' => $newStatus]);

            $towingRequest->logs()->create([
                'status' => $newStatus,
                'updated_by' => $request->user()->id
            ]);

            if ($request->hasFile('images')) {
                foreach ($request->file('images') as $image) {
                    $path = $image->store('request_media', 'public');
                    RequestMedia::create([
                        'request_id' => $towingRequest->id,
                        'image_path' => $path,
                        'uploaded_by' => $request->user()->id
                    ]);
                }
            }

            if ($newStatus === 'completed') {
                $request->user()->update(['is_available' => true]);
            }

            // Send email to customer via queue
            if ($towingRequest->customer_email) {
                $mailType = $newStatus === 'in_progress' ? 'ongoing' : ($newStatus === 'completed' ? 'completed' : null);
                if ($mailType) {
                    SendTowingStatusEmailJob::dispatch($towingRequest, $mailType, $towingRequest->customer_email, $towingRequest->customer_name);
                }
            }

            return new SuccessResource([
                'message' => "Request status updated to {$newStatus}",
                'data' => new TowingRequestResource($towingRequest->load(['customer', 'logs', 'media']))
            ]);
        });
    }

    public function current(Request $request)
    {
        $towingRequest = TowingRequest::where('accepted_by', $request->user()->id)
            ->whereIn('status', ['accepted', 'in_progress'])
            ->with(['customer', 'logs', 'media'])
            ->first();

        if (!$towingRequest) {
            return new SuccessResource([
                'message' => 'No active request found',
                'data' => null
            ]);
        }

        return new SuccessResource([
            'message' => 'Active request retrieved successfully',
            'data' => new TowingRequestResource($towingRequest)
        ]);
    }

    public function history(Request $request)
    {
        $filter = $request->query('filter', 'all');

        $query = TowingRequest::where('accepted_by', $request->user()->id)
            ->with(['customer', 'logs']);

        if ($filter === 'completed') {
            $query->where('status', 'completed');
        } elseif ($filter === 'cancelled') {
            $query->where('status', 'cancelled');
        } elseif ($filter === 'active') {
            $query->whereIn('status', ['accepted', 'in_progress']);
        } else {
            // 'all' includes everything assigned to the driver
            $query->whereIn('status', ['accepted', 'in_progress', 'completed', 'cancelled']);
        }

        $requests = $query->latest()->paginate(15);

        return TowingRequestResource::collection($requests);
    }
}
