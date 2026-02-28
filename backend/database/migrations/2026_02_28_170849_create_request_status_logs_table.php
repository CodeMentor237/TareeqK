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
        Schema::create('request_status_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->constrained('towing_requests')->onDelete('cascade');
            $table->string('status');
            $table->foreignId('updated_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();

            $table->index('request_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('request_status_logs');
    }
};
