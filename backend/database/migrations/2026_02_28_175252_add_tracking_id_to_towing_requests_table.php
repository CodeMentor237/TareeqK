<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('towing_requests', function (Blueprint $table) {
            $table->string('tracking_id', 10)->nullable()->after('id');
        });

        // Populate existing records
        $requests = DB::table('towing_requests')->get();
        foreach ($requests as $request) {
            $trackingId = 'TK' . strtoupper(\Illuminate\Support\Str::random(8));
            // Ensure uniqueness during population
            while (DB::table('towing_requests')->where('tracking_id', $trackingId)->exists()) {
                $trackingId = 'TK' . strtoupper(\Illuminate\Support\Str::random(8));
            }
            DB::table('towing_requests')->where('id', $request->id)->update(['tracking_id' => $trackingId]);
        }

        Schema::table('towing_requests', function (Blueprint $table) {
            $table->string('tracking_id', 10)->nullable(false)->unique()->index()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('towing_requests', function (Blueprint $table) {
            //
        });
    }
};
