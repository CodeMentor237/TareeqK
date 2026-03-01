<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\SuccessResource;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    /**
     * List users filtered by role.
     */
    public function index(Request $request)
    {
        $request->validate([
            'role' => 'required|in:customer,driver'
        ]);

        $users = User::where('role', $request->role)
            ->latest()
            ->paginate(20);

        return new SuccessResource([
            'message' => ucfirst($request->role) . 's retrieved successfully',
            'data' => $users
        ]);
    }

    /**
     * Show user details.
     */
    public function show($id)
    {
        $user = User::findOrFail($id);
        
        return new SuccessResource([
            'message' => 'User details retrieved successfully',
            'data' => $user
        ]);
    }
}
