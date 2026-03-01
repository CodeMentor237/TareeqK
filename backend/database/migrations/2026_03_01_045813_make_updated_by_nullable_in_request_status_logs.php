<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('request_status_logs', function (Blueprint $table) {
            $table->foreignId('updated_by')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('request_status_logs', function (Blueprint $table) {
            $table->foreignId('updated_by')->nullable(false)->change();
        });
    }
};
