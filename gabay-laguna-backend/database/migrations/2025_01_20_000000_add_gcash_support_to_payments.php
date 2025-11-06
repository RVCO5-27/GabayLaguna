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
        // Add GCash support to payments table
        Schema::table('payments', function (Blueprint $table) {
            $table->string('reference_number', 50)->unique()->nullable()->after('transaction_id');
            $table->string('gcash_qr_code', 255)->nullable()->after('reference_number');
            $table->string('gcash_account_number', 20)->nullable()->after('gcash_qr_code');
            $table->string('payment_screenshot_path')->nullable()->after('payment_details');
            $table->enum('verification_status', ['pending', 'verified', 'rejected'])->default('pending')->after('status');
            $table->text('rejection_reason')->nullable()->after('verification_status');
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null')->after('rejection_reason');
            $table->timestamp('verified_at')->nullable()->after('verified_by');
        });

        // Add payment status tracking to bookings table
        Schema::table('bookings', function (Blueprint $table) {
            $table->enum('payment_status', ['pending', 'partially_paid', 'fully_paid', 'refunded'])->default('pending')->after('status');
            $table->decimal('initial_payment_amount', 10, 2)->nullable()->after('total_amount');
            $table->decimal('final_payment_amount', 10, 2)->nullable()->after('initial_payment_amount');
            $table->timestamp('paid_at')->nullable()->after('final_payment_amount');
        });

        // Create GCash configuration table
        Schema::create('gcash_configurations', function (Blueprint $table) {
            $table->id();
            $table->string('account_name');
            $table->string('account_number', 20)->unique();
            $table->string('qrcode_image_path')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('gcash_configurations');

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn([
                'payment_status',
                'initial_payment_amount',
                'final_payment_amount',
                'paid_at'
            ]);
        });

        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn([
                'reference_number',
                'gcash_qr_code',
                'gcash_account_number',
                'payment_screenshot_path',
                'verification_status',
                'rejection_reason',
                'verified_by',
                'verified_at'
            ]);
        });
    }
};

