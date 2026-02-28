<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\TowingRequestResource;
use App\Http\Resources\SuccessResource;
use App\Models\TowingRequest;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class RequestController extends Controller
{
    public function dashboard()
    {
        return new SuccessResource([
            'message' => 'Dashboard statistics retrieved successfully',
            'data' => [
                'total_requests' => TowingRequest::count(),
                'active_requests' => TowingRequest::whereIn('status', ['pending', 'accepted', 'ongoing'])->count(),
                'completed_requests' => TowingRequest::where('status', 'completed')->count(),
                'cancelled_requests' => TowingRequest::where('status', 'cancelled')->count(),
                'available_drivers' => User::where('role', 'driver')->where('is_available', true)->count(),
            ]
        ]);
    }

    public function index(Request $request)
    {
        $query = TowingRequest::with(['customer', 'driver', 'logs', 'media']);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $requests = $query->latest()->paginate(20);

        return TowingRequestResource::collection($requests);
    }

    public function reassign(Request $request, $id)
    {
        $request->validate([
            'driver_id' => 'required|exists:users,id'
        ]);

        return DB::transaction(function () use ($request, $id) {
            $towingRequest = TowingRequest::where('tracking_id', $id)->first();

            if (!$towingRequest) {
                return new SuccessResource([
                    'message' => 'Request not found',
                    'data' => null
                ]);
            }

            $newDriver = User::where('id', $request->driver_id)->where('role', 'driver')->firstOrFail();

            if (!$newDriver->is_available) {
                return response()->json(['message' => 'New driver is not available'], 422);
            }

            // Free old driver if exists
            if ($towingRequest->accepted_by) {
                User::find($towingRequest->accepted_by)->update(['is_available' => true]);
            }

            $towingRequest->update([
                'accepted_by' => $newDriver->id,
                'status' => 'accepted' // Reset to accepted if it was pending or ongoing? Plan says just "Reassign"
            ]);

            $newDriver->update(['is_available' => false]);

            $towingRequest->logs()->create([
                'status' => 'reassigned',
                'updated_by' => $request->user()->id // Admin ID
            ]);

            return new SuccessResource([
                'message' => 'Driver reassigned successfully',
                'data' => new TowingRequestResource($towingRequest->load(['driver', 'logs']))
            ]);
        });
    }

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:pending,accepted,ongoing,completed,cancelled'
        ]);

        return DB::transaction(function () use ($request, $id) {
            $towingRequest = TowingRequest::where('tracking_id', $id)->first();

            if (!$towingRequest) {
                return new SuccessResource([
                    'message' => 'Request not found',
                    'data' => null
                ]);
            }

            $oldStatus = $towingRequest->status;
            $newStatus = $request->status;

            $towingRequest->update(['status' => $newStatus]);

            $towingRequest->logs()->create([
                'status' => $newStatus,
                'updated_by' => $request->user()->id
            ]);

            // Handle driver availability based on status
            if ($newStatus === 'completed' || $newStatus === 'cancelled') {
                if ($towingRequest->accepted_by) {
                    User::find($towingRequest->accepted_by)->update(['is_available' => true]);
                }
            } elseif ($newStatus === 'accepted' || $newStatus === 'ongoing') {
                if ($towingRequest->accepted_by) {
                    User::find($towingRequest->accepted_by)->update(['is_available' => false]);
                }
            }

            return new SuccessResource([
                'message' => "Request status updated to {$newStatus}",
                'data' => new TowingRequestResource($towingRequest->load(['driver', 'logs']))
            ]);
        });
    }
}
