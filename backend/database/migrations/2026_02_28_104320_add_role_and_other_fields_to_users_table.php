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
        Schema::table('users', function (Blueprint $table) {
            $table->string('role')->default('user')->after('password');
            $table->string('phone')->nullable()->after('role');
            $table->string('avatar')->nullable()->after('phone');
            $table->string('otp_code')->nullable()->after('avatar');
            $table->boolean('is_active')->default(true)->after('otp_code');
            $table->boolean('is_verified')->default(false)->after('is_active');
            $table->boolean('is_deleted')->default(false)->after('is_verified');
            $table->timestamp('last_login_at')->nullable()->after('is_deleted');
            $table->timestamp('otp_expires_at')->nullable()->after('last_login_at');
            $table->timestamp('phone_verified_at')->nullable()->after('otp_expires_at');
            $table->timestamp('otp_verified_at')->nullable()->after('phone_verified_at');
            $table->timestamp('deleted_at')->nullable()->after('otp_verified_at');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['role', 'phone', 'avatar', 'otp_code', 'is_active', 'is_verified', 'is_deleted', 'last_login_at', 'otp_expires_at', 'phone_verified_at', 'otp_verified_at', 'deleted_at']);
        });
    }
};
