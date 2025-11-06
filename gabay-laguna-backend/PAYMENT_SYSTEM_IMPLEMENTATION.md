# Payment System & Receipts Implementation Guide

## ✅ Current System Analysis

### What We Already Have:
1. **Basic Payment System** - PayPal, PayMongo, and Xendit integrations
2. **Payment Model** - Basic structure with booking relationship
3. **PaymentService** - Core payment processing logic
4. **Database Tables** - payments and bookings tables exist

### What Needs to Be Added:
1. **Payment Types** (initial/final/full payments)
2. **Receipts Table** (PDF storage, hash, QR codes)
3. **Receipt Generation Logic**
4. **Payment Status on Bookings**
5. **Enhanced Payment Processing**

---

## 📋 Implementation Checklist

### Phase 1: Database Setup & Core Structure

#### 1. Create Migration for Enhanced Payments & Receipts
**File:** `create_enhanced_payments_system.php`

```php
<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Add columns to payments table
        Schema::table('payments', function (Blueprint $table) {
            $table->enum('payment_type', ['initial', 'final', 'full'])->default('full')->after('payment_method');
            $table->string('receipt_number', 50)->unique()->nullable()->after('transaction_id');
            $table->timestamp('receipt_generated_at')->nullable()->after('paid_at');
        });

        // Create receipts table
        Schema::create('receipts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->constrained()->onDelete('cascade');
            $table->enum('receipt_type', ['initial', 'final', 'full']);
            $table->string('file_path');
            $table->string('hash_sha256')->unique();
            $table->string('qr_code_path')->nullable();
            $table->integer('download_count')->default(0);
            $table->boolean('downloaded_by_tourist')->default(false);
            $table->boolean('downloaded_by_guide')->default(false);
            $table->timestamps();
        });

        // Add columns to bookings table
        Schema::table('bookings', function (Blueprint $table) {
            $table->enum('payment_status', ['pending', 'partially_paid', 'fully_paid', 'refunded'])->default('pending')->after('status');
            $table->decimal('initial_payment_amount', 10, 2)->nullable()->after('total_amount');
            $table->decimal('final_payment_amount', 10, 2)->nullable()->after('initial_payment_amount');
            $table->timestamp('paid_at')->nullable()->after('final_payment_amount');
        });
    }

    public function down(): void
    {
        Schema::table('payments', function (Blueprint $table) {
            $table->dropColumn(['payment_type', 'receipt_number', 'receipt_generated_at']);
        });

        Schema::dropIfExists('receipts');

        Schema::table('bookings', function (Blueprint $table) {
            $table->dropColumn(['payment_status', 'initial_payment_amount', 'final_payment_amount', 'paid_at']);
        });
    }
};
```

#### 2. Update Models

**Payment.php** - Add relationships and fillable fields:
```php
protected $fillable = [
    'booking_id',
    'payment_method',
    'payment_type',      // NEW
    'transaction_id',
    'amount',
    'status',
    'receipt_number',     // NEW
    'payment_details',
    'paid_at',
    'receipt_generated_at', // NEW
];

// Add relationship
public function receipts()
{
    return $this->hasMany(Receipt::class);
}
```

**Receipt Model** - Create new file:
```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Receipt extends Model
{
    use HasFactory;

    protected $fillable = [
        'payment_id',
        'receipt_type',
        'file_path',
        'hash_sha256',
        'qr_code_path',
        'download_count',
        'downloaded_by_tourist',
        'downloaded_by_guide',
    ];

    public function payment()
    {
        return $this->belongsTo(Payment::class);
    }
}
```

**Booking.php** - Update fillable and add methods:
```php
protected $fillable = [
    // ... existing fields
    'payment_status',           // NEW
    'initial_payment_amount',   // NEW
    'final_payment_amount',     // NEW
    'paid_at',                  // NEW
];

protected $casts = [
    // ... existing casts
    'initial_payment_amount' => 'decimal:2',
    'final_payment_amount' => 'decimal:2',
    'paid_at' => 'datetime',
];

// Add helper methods
public function isPaymentComplete(): bool
{
    return $this->payment_status === 'fully_paid';
}

public function calculateInitialPayment(): float
{
    return round($this->total_amount * 0.30, 2);
}

public function calculateFinalPayment(): float
{
    return round($this->total_amount * 0.70, 2);
}
```

---

### Phase 2: Payment Processing Logic Enhancement

#### 3. Create Enhanced PaymentService Methods

**Add to PaymentService.php:**

```php
/**
 * Process initial payment (30% deposit)
 */
public function processInitialPayment(Booking $booking, string $paymentMethod): array
{
    $amount = $booking->calculateInitialPayment();
    
    // Create payment record
    $payment = Payment::create([
        'booking_id' => $booking->id,
        'payment_method' => $paymentMethod,
        'payment_type' => 'initial',
        'amount' => $amount,
        'status' => 'pending',
        'receipt_number' => $this->generateReceiptNumber(),
    ]);

    // Process payment based on method
    if ($paymentMethod === 'paypal') {
        $result = $this->createPayPalPayment($booking, $amount);
    } elseif ($paymentMethod === 'paymongo') {
        $result = $this->createPayMongoPaymentIntent($booking, $amount);
    } else {
        $result = $this->createXenditInvoice($booking, $amount);
    }

    if ($result['success']) {
        // Update booking payment status
        $booking->update([
            'payment_status' => 'partially_paid',
            'initial_payment_amount' => $amount,
        ]);

        return [
            'success' => true,
            'payment' => $payment,
            'amount' => $amount,
            'payment_url' => $result['payment_url'] ?? null,
        ];
    }

    return ['success' => false, 'error' => 'Payment processing failed'];
}

/**
 * Process final payment (70% remainder)
 */
public function processFinalPayment(Booking $booking, string $paymentMethod): array
{
    $amount = $booking->calculateFinalPayment();
    
    $payment = Payment::create([
        'booking_id' => $booking->id,
        'payment_method' => $paymentMethod,
        'payment_type' => 'final',
        'amount' => $amount,
        'status' => 'pending',
        'receipt_number' => $this->generateReceiptNumber(),
    ]);

    // Process payment
    $result = $this->processPaymentByMethod($booking, $amount, $paymentMethod);

    if ($result['success']) {
        // Update booking payment status to fully paid
        $booking->update([
            'payment_status' => 'fully_paid',
            'final_payment_amount' => $amount,
            'paid_at' => now(),
        ]);

        return [
            'success' => true,
            'payment' => $payment,
            'amount' => $amount,
            'payment_url' => $result['payment_url'] ?? null,
        ];
    }

    return ['success' => false, 'error' => 'Payment processing failed'];
}

/**
 * Process full payment (100% upfront)
 */
public function processFullPayment(Booking $booking, string $paymentMethod): array
{
    $amount = $booking->total_amount;
    
    $payment = Payment::create([
        'booking_id' => $booking->id,
        'payment_method' => $paymentMethod,
        'payment_type' => 'full',
        'amount' => $amount,
        'status' => 'pending',
        'receipt_number' => $this->generateReceiptNumber(),
    ]);

    // Process payment
    $result = $this->processPaymentByMethod($booking, $amount, $paymentMethod);

    if ($result['success']) {
        $booking->update([
            'payment_status' => 'fully_paid',
            'paid_at' => now(),
        ]);

        return [
            'success' => true,
            'payment' => $payment,
            'amount' => $amount,
            'payment_url' => $result['payment_url'] ?? null,
        ];
    }

    return ['success' => false, 'error' => 'Payment processing failed'];
}

/**
 * Generate receipt number
 */
protected function generateReceiptNumber(): string
{
    return 'GR-' . date('Ymd') . '-' . strtoupper(Str::random(6));
}

/**
 * Process payment based on method
 */
protected function processPaymentByMethod(Booking $booking, float $amount, string $method): array
{
    if ($method === 'paypal') {
        return $this->createPayPalPayment($booking, $amount);
    } elseif ($method === 'paymongo') {
        return $this->createPayMongoPaymentIntent($booking, $amount);
    } else {
        return $this->createXenditInvoice($booking, $amount);
    }
}
```

---

### Phase 3: Receipt Generation

#### 4. Create ReceiptService

**Create File:** `app/Services/ReceiptService.php`

```php
<?php

namespace App\Services;

use App\Models\Receipt;
use App\Models\Payment;
use Illuminate\Support\Str;
use Barryvdh\DomPDF\Facade\Pdf;
use Storage;

class ReceiptService
{
    /**
     * Generate receipt for payment
     */
    public function generateReceipt(Payment $payment): Receipt
    {
        // Generate QR code data
        $qrData = $this->generateQRData($payment);
        $qrCodePath = $this->generateQRCode($qrData);

        // Generate PDF
        $pdf = PDF::loadView('receipts.template', [
            'payment' => $payment,
            'booking' => $payment->booking,
            'qrData' => $qrData,
        ]);

        // Save PDF
        $fileName = "receipt-{$payment->receipt_number}.pdf";
        $filePath = "receipts/{$fileName}";
        
        Storage::put($filePath, $pdf->output());

        // Calculate hash
        $hash = hash_file('sha256', Storage::path($filePath));

        // Create receipt record
        return Receipt::create([
            'payment_id' => $payment->id,
            'receipt_type' => $payment->payment_type,
            'file_path' => $filePath,
            'hash_sha256' => $hash,
            'qr_code_path' => $qrCodePath,
        ]);
    }

    /**
     * Generate QR data for receipt
     */
    protected function generateQRData(Payment $payment): string
    {
        return json_encode([
            'receipt_number' => $payment->receipt_number,
            'payment_id' => $payment->id,
            'amount' => $payment->amount,
            'hash' => $this->generateReceiptHash($payment),
        ]);
    }

    /**
     * Generate hash for tamper detection
     */
    protected function generateReceiptHash(Payment $payment): string
    {
        $data = [
            $payment->id,
            $payment->amount,
            $payment->booking_id,
            $payment->paid_at,
        ];

        return hash('sha256', json_encode($data));
    }

    /**
     * Generate QR code image
     */
    protected function generateQRCode(string $data): string
    {
        // Use a QR code library (e.g., SimpleSoftwareIO/simple-qrcode)
        $qrCode = \SimpleSoftwareIO\QrCode\Facades\QrCode::format('png')
            ->size(200)
            ->generate($data);

        $fileName = "qr-{$payment->receipt_number}.png";
        $filePath = "qr-codes/{$fileName}";
        
        Storage::put($filePath, $qrCode);

        return $filePath;
    }

    /**
     * Verify receipt integrity
     */
    public function verifyReceipt(Receipt $receipt): bool
    {
        if (!Storage::exists($receipt->file_path)) {
            return false;
        }

        $currentHash = hash_file('sha256', Storage::path($receipt->file_path));
        
        return $currentHash === $receipt->hash_sha256;
    }

    /**
     * Download receipt for user
     */
    public function downloadReceipt(Receipt $receipt, string $userType): array
    {
        if (!Storage::exists($receipt->file_path)) {
            return ['success' => false, 'error' => 'Receipt not found'];
        }

        // Update download tracking
        $receipt->increment('download_count');
        
        if ($userType === 'tourist') {
            $receipt->update(['downloaded_by_tourist' => true]);
        } else {
            $receipt->update(['downloaded_by_guide' => true]);
        }

        return [
            'success' => true,
            'file_path' => Storage::path($receipt->file_path),
            'file_name' => basename($receipt->file_path),
        ];
    }
}
```

---

## 🚀 Implementation Steps

### Step 1: Run Migration
```bash
php artisan make:migration create_enhanced_payments_system
# Copy the migration code above
php artisan migrate
```

### Step 2: Update Models
- Update `Payment.php`
- Create `Receipt.php`
- Update `Booking.php`

### Step 3: Create Receipt Service
```bash
php artisan make:service ReceiptService
# Copy the service code above
```

### Step 4: Create Receipt Blade Template
**File:** `resources/views/receipts/template.blade.php`
```html
<!DOCTYPE html>
<html>
<head>
    <title>Receipt - {{ $payment->receipt_number }}</title>
    <style>
        /* Add receipt styling */
    </style>
</head>
<body>
    <h1>Payment Receipt</h1>
    <p>Receipt Number: {{ $payment->receipt_number }}</p>
    <p>Amount: PHP {{ number_format($payment->amount, 2) }}</p>
    <p>Payment Type: {{ ucfirst($payment->payment_type) }}</p>
    <img src="{{ Storage::url($qrCodePath) }}" alt="QR Code">
</body>
</html>
```

### Step 5: Install Required Packages
```bash
composer require barryvdh/laravel-dompdf
composer require simplesoftwareio/simple-qrcode
```

### Step 6: Update Payment Controller
Add new endpoints for initial/final/full payments

---

## ✅ Summary

**Feasibility: YES** - The implementation is very feasible because:
1. ✅ Core payment infrastructure already exists
2. ✅ Only need to add columns and new tables
3. ✅ Can reuse existing PaymentService logic
4. ✅ Laravel has excellent PDF and QR code libraries

**Estimated Time:** 2-3 days for full implementation

**Priority Features:**
1. Database migration (1 hour)
2. Update models (1 hour)
3. Receipt service (2-3 hours)
4. Enhanced payment methods (2-3 hours)
5. Receipt template & PDF generation (2-3 hours)
6. Testing & refinement (2-3 hours)

