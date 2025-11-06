# GCash Integration Implementation Plan

## ✅ Feasibility Assessment

**Status: HIGHLY FEASIBLE** ✅

### Current Situation:
- ✅ Basic payment infrastructure exists
- ✅ PaymentService ready to extend
- ✅ PayPal and PayMongo already integrated
- ✅ Can leverage existing payment processing patterns

### GCash Integration Approach:
Since GCash doesn't have a direct API like PayPal/PayMongo, we'll implement a **manual verification system** with:
1. **QR Code Display** - Generate QR for tourists to scan
2. **Reference Number System** - Unique reference per payment
3. **Payment Screenshot Upload** - Tourist uploads proof of payment
4. **Admin Verification** - Admin verifies and confirms payment
5. **Payment Status Tracking** - Real-time status updates

---

## 📋 Implementation Plan

### Phase 1: Database Schema (GCash Support)

#### 1.1 Update Payments Table
Add GCash-specific columns to existing `payments` table:

```php
Schema::table('payments', function (Blueprint $table) {
    // GCash-specific fields
    $table->string('reference_number', 50)->unique()->nullable()->after('transaction_id');
    $table->string('gcash_qr_code', 255)->nullable()->after('reference_number');
    $table->string('gcash_account_number', 20)->nullable()->after('gcash_qr_code');
    $table->string('payment_screenshot_path')->nullable()->after('payment_details');
    $table->enum('verification_status', ['pending', 'verified', 'rejected'])->default('pending')->after('status');
    $table->text('rejection_reason')->nullable()->after('verification_status');
    $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null')->after('rejection_reason');
    $table->timestamp('verified_at')->nullable()->after('verified_by');
});
```

#### 1.2 Create GCash Configuration Table

```php
Schema::create('gcash_configurations', function (Blueprint $table) {
    $table->id();
    $table->string('account_name');
    $table->string('account_number', 20)->unique();
    $table->string('qrcode_image_path')->nullable();
    $table->boolean('is_active')->default(true);
    $table->timestamps();
});
```

---

### Phase 2: GCash Service Implementation

#### 2.1 Create GCashService

**File:** `app/Services/GCashService.php`

```php
<?php

namespace App\Services;

use App\Models\Payment;
use App\Models\Booking;
use App\Models\GCashConfiguration;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Log;

class GCashService
{
    protected $gcashConfig;

    public function __construct()
    {
        $this->gcashConfig = GCashConfiguration::where('is_active', true)->first();
    }

    /**
     * Create GCash payment request
     */
    public function createGCashPayment(Booking $booking): array
    {
        try {
            // Generate unique reference number
            $referenceNumber = $this->generateReferenceNumber($booking);
            
            // Get GCash account details
            $gcashAccount = $this->getGCashAccount();
            
            // Generate QR code data
            $qrData = $this->generateQRCodeData($gcashAccount, $booking->total_amount, $referenceNumber);
            
            // Create payment record
            $payment = Payment::create([
                'booking_id' => $booking->id,
                'payment_method' => 'gcash',
                'transaction_id' => $referenceNumber,
                'reference_number' => $referenceNumber,
                'gcash_account_number' => $gcashAccount->account_number,
                'gcash_qr_code' => $qrData['qr_string'],
                'amount' => $booking->total_amount,
                'status' => 'pending',
                'verification_status' => 'pending',
                'payment_details' => [
                    'account_name' => $gcashAccount->account_name,
                    'account_number' => $gcashAccount->account_number,
                    'reference_number' => $referenceNumber,
                    'booking_id' => $booking->id,
                    'created_at' => now()->toDateTimeString(),
                ]
            ]);

            // Generate QR code image (optional)
            $qrCodeImage = $this->generateQRCodeImage($qrData['qr_string'], $referenceNumber);

            return [
                'success' => true,
                'payment' => $payment,
                'reference_number' => $referenceNumber,
                'gcash_account' => [
                    'account_name' => $gcashAccount->account_name,
                    'account_number' => $gcashAccount->account_number,
                ],
                'qr_code_data' => $qrData['qr_string'],
                'qr_code_image' => $qrCodeImage,
                'instructions' => $this->getPaymentInstructions(),
            ];

        } catch (\Exception $e) {
            Log::error('GCash payment creation error', [
                'booking_id' => $booking->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Failed to create GCash payment'
            ];
        }
    }

    /**
     * Generate unique reference number
     */
    protected function generateReferenceNumber(Booking $booking): string
    {
        do {
            $refNumber = 'GCASH-' . date('Ymd') . '-' . strtoupper(Str::random(8));
        } while (Payment::where('reference_number', $refNumber)->exists());

        return $refNumber;
    }

    /**
     * Generate GCash QR code data string
     */
    protected function generateQRCodeData($accountNumber, $amount, $referenceNumber): array
    {
        // GCash QR format: {account}|{amount}|{reference}
        $qrString = "{$accountNumber}|{$amount}|{$referenceNumber}";
        
        return [
            'qr_string' => $qrString,
            'account_number' => $accountNumber,
            'amount' => $amount,
            'reference_number' => $referenceNumber,
        ];
    }

    /**
     * Generate QR code image using SimpleSoftwareIO QrCode
     */
    protected function generateQRCodeImage(string $qrData, string $referenceNumber): string
    {
        $qrCode = \SimpleSoftwareIO\QrCode\Facades\QrCode::format('png')
            ->size(300)
            ->generate($qrData);

        $fileName = "gcash-qr-{$referenceNumber}.png";
        $filePath = "gcash-qr-codes/{$fileName}";
        
        Storage::put($filePath, $qrCode);

        return $filePath;
    }

    /**
     * Get active GCash account
     */
    protected function getGCashAccount()
    {
        if (!$this->gcashConfig) {
            throw new \Exception('No active GCash configuration found');
        }

        return $this->gcashConfig;
    }

    /**
     * Get payment instructions for user
     */
    protected function getPaymentInstructions(): array
    {
        return [
            'step1' => 'Open your GCash app',
            'step2' => 'Tap "Scan QR" or go to "Send Money"',
            'step3' => 'Scan the QR code or enter the account number manually',
            'step4' => 'Enter the exact amount shown',
            'step5' => 'Add the reference number in the message/notes field',
            'step6' => 'Complete the payment',
            'step7' => 'Take a screenshot of the payment confirmation',
            'step8' => 'Upload the screenshot on this page',
            'step9' => 'Wait for admin verification (usually within 24 hours)',
        ];
    }

    /**
     * Upload payment screenshot
     */
    public function uploadPaymentScreenshot(Payment $payment, $screenshotFile): array
    {
        try {
            // Validate file
            if (!$screenshotFile->isValid()) {
                return ['success' => false, 'error' => 'Invalid file'];
            }

            // Check file type (allow jpg, png, pdf)
            $allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
            if (!in_array($screenshotFile->getMimeType(), $allowedTypes)) {
                return ['success' => false, 'error' => 'File must be JPG, PNG, or PDF'];
            }

            // Check file size (max 5MB)
            if ($screenshotFile->getSize() > 5242880) {
                return ['success' => false, 'error' => 'File size must be less than 5MB'];
            }

            // Store file
            $fileName = "payment-{$payment->reference_number}-" . time() . '.' . $screenshotFile->getClientOriginalExtension();
            $filePath = $screenshotFile->storeAs('payment-screenshots', $fileName, 'public');

            // Update payment record
            $payment->update([
                'payment_screenshot_path' => $filePath,
                'verification_status' => 'pending',
            ]);

            // Notify admin
            $this->notifyAdminForVerification($payment);

            return [
                'success' => true,
                'message' => 'Screenshot uploaded successfully. Awaiting admin verification.',
                'payment' => $payment->fresh()
            ];

        } catch (\Exception $e) {
            Log::error('GCash screenshot upload error', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Failed to upload screenshot'
            ];
        }
    }

    /**
     * Verify GCash payment (Admin function)
     */
    public function verifyPayment(Payment $payment, bool $isVerified, $userId, string $rejectionReason = null): array
    {
        try {
            if ($isVerified) {
                $payment->update([
                    'status' => 'completed',
                    'verification_status' => 'verified',
                    'paid_at' => now(),
                    'verified_by' => $userId,
                    'verified_at' => now(),
                ]);

                // Update booking status
                $payment->booking->update(['status' => 'confirmed']);

                // Generate receipt
                $receiptService = new ReceiptService();
                $receiptService->generateReceipt($payment);

                // Notify user
                $this->notifyUserOfPaymentConfirmation($payment);

                return [
                    'success' => true,
                    'message' => 'Payment verified and booking confirmed',
                    'payment' => $payment->fresh()
                ];

            } else {
                $payment->update([
                    'verification_status' => 'rejected',
                    'rejection_reason' => $rejectionReason,
                ]);

                // Notify user of rejection
                $this->notifyUserOfPaymentRejection($payment, $rejectionReason);

                return [
                    'success' => true,
                    'message' => 'Payment rejected',
                    'payment' => $payment->fresh()
                ];
            }

        } catch (\Exception $e) {
            Log::error('GCash payment verification error', [
                'payment_id' => $payment->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => 'Failed to verify payment'
            ];
        }
    }

    /**
     * Get payment status
     */
    public function getPaymentStatus(Payment $payment): array
    {
        return [
            'payment_id' => $payment->id,
            'reference_number' => $payment->reference_number,
            'status' => $payment->status,
            'verification_status' => $payment->verification_status,
            'amount' => $payment->amount,
            'created_at' => $payment->created_at,
            'paid_at' => $payment->paid_at,
            'rejection_reason' => $payment->rejection_reason,
        ];
    }

    /**
     * Notify admin for verification
     */
    protected function notifyAdminForVerification(Payment $payment): void
    {
        // Send notification to admin users
        // Implementation depends on your notification system
        // Example: Send email or push notification
    }

    /**
     * Notify user of payment confirmation
     */
    protected function notifyUserOfPaymentConfirmation(Payment $payment): void
    {
        // Send notification to tourist
        // Example: Email or SMS notification
    }

    /**
     * Notify user of payment rejection
     */
    protected function notifyUserOfPaymentRejection(Payment $payment, string $reason): void
    {
        // Send notification to tourist about rejection
        // Include reason and instructions
    }

    /**
     * Auto-verify GCash payment (if using PayMongo GCash integration)
     */
    public function processGCashPaymentViaPayMongo(Booking $booking): array
    {
        // This uses PayMongo's GCash integration which has automatic verification
        $paymongoService = new PaymentService();
        
        return $paymongoService->createPayMongoPaymentIntent($booking);
    }
}
```

---

### Phase 3: Controller & Routes

#### 3.1 Create GCash Controller

```php
<?php

namespace App\Http\Controllers;

use App\Services\GCashService;
use App\Models\Payment;
use App\Models\Booking;
use Illuminate\Http\Request;

class GCashPaymentController extends Controller
{
    protected $gcashService;

    public function __construct(GCashService $gcashService)
    {
        $this->gcashService = $gcashService;
    }

    /**
     * Initiate GCash payment
     */
    public function initiatePayment(Request $request)
    {
        $request->validate([
            'booking_id' => 'required|exists:bookings,id',
        ]);

        $booking = Booking::findOrFail($request->booking_id);
        
        $result = $this->gcashService->createGCashPayment($booking);

        if ($result['success']) {
            return response()->json($result);
        }

        return response()->json($result, 400);
    }

    /**
     * Upload payment screenshot
     */
    public function uploadScreenshot(Request $request, $paymentId)
    {
        $request->validate([
            'screenshot' => 'required|image|mimes:jpeg,png,jpg,pdf|max:5120',
        ]);

        $payment = Payment::findOrFail($paymentId);
        
        $result = $this->gcashService->uploadPaymentScreenshot(
            $payment,
            $request->file('screenshot')
        );

        return response()->json($result);
    }

    /**
     * Get payment status
     */
    public function getPaymentStatus($paymentId)
    {
        $payment = Payment::findOrFail($paymentId);
        
        $status = $this->gcashService->getPaymentStatus($payment);

        return response()->json($status);
    }

    /**
     * Admin: Verify payment
     */
    public function verifyPayment(Request $request, $paymentId)
    {
        $request->validate([
            'is_verified' => 'required|boolean',
            'rejection_reason' => 'required_if:is_verified,false|string|max:500',
        ]);

        $payment = Payment::findOrFail($paymentId);
        
        $result = $this->gcashService->verifyPayment(
            $payment,
            $request->is_verified,
            auth()->id(),
            $request->rejection_reason ?? null
        );

        return response()->json($result);
    }

    /**
     * Admin: Get pending payments for verification
     */
    public function getPendingVerifications()
    {
        $payments = Payment::where('payment_method', 'gcash')
            ->where('verification_status', 'pending')
            ->with(['booking', 'booking.tourist'])
            ->orderBy('created_at', 'desc')
            ->paginate(20);

        return response()->json($payments);
    }
}
```

#### 3.2 Add Routes

```php
// routes/api.php

// Tourist routes
Route::post('/gcash/initiate', [GCashPaymentController::class, 'initiatePayment']);
Route::post('/gcash/{paymentId}/upload-screenshot', [GCashPaymentController::class, 'uploadScreenshot']);
Route::get('/gcash/{paymentId}/status', [GCashPaymentController::class, 'getPaymentStatus']);

// Admin routes
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/admin/gcash/{paymentId}/verify', [GCashPaymentController::class, 'verifyPayment']);
    Route::get('/admin/gcash/pending-verifications', [GCashPaymentController::class, 'getPendingVerifications']);
});
```

---

### Phase 4: Frontend Implementation

#### 4.1 GCash Payment Component

**File:** `gabay-laguna-frontend/src/components/GCashPayment.jsx`

```jsx
import React, { useState } from 'react';
import { Upload, QrCode, CheckCircle, Clock } from 'react-icons/fa';

const GCashPayment = ({ booking, onPaymentComplete }) => {
  const [paymentData, setPaymentData] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('pending');

  const handleInitiatePayment = async () => {
    // Call API to initiate GCash payment
    const response = await fetch('/api/gcash/initiate', {
      method: 'POST',
      body: JSON.stringify({ booking_id: booking.id }),
    });
    
    const data = await response.json();
    setPaymentData(data);
  };

  const handleScreenshotUpload = async (event) => {
    const file = event.target.files[0];
    setUploading(true);
    
    const formData = new FormData();
    formData.append('screenshot', file);
    
    await fetch(`/api/gcash/${paymentData.payment.id}/upload-screenshot`, {
      method: 'POST',
      body: formData,
    });
    
    setUploading(false);
    setStatus('uploaded');
  };

  return (
    <div className="gcash-payment-container">
      {/* Display QR Code */}
      {paymentData?.qr_code_image && (
        <div className="qr-code-section">
          <img src={paymentData.qr_code_image} alt="GCash QR Code" />
          <p>Scan this QR code with your GCash app</p>
        </div>
      )}

      {/* Payment Instructions */}
      <div className="instructions">
        <h4>How to Pay:</h4>
        <ol>
          {paymentData?.instructions?.map((instruction, index) => (
            <li key={index}>{instruction}</li>
          ))}
        </ol>
      </div>

      {/* Screenshot Upload */}
      <div className="screenshot-upload">
        <label>
          <Upload /> Upload Payment Screenshot
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={handleScreenshotUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {/* Status Display */}
      <div className="status">
        {status === 'uploaded' && <Clock /> Waiting for verification...}
        {status === 'verified' && <CheckCircle /> Payment verified!}
      </div>
    </div>
  );
};
```

---

### Phase 5: Admin Verification Interface

#### 5.1 Admin Verification Page

**File:** `gabay-laguna-frontend/src/pages/AdminGCashVerification.jsx`

```jsx
import React, { useState, useEffect } from 'react';

const AdminGCashVerification = () => {
  const [pendingPayments, setPendingPayments] = useState([]);

  useEffect(() => {
    fetchPendingPayments();
  }, []);

  const fetchPendingPayments = async () => {
    const response = await fetch('/api/admin/gcash/pending-verifications');
    const data = await response.json();
    setPendingPayments(data);
  };

  const handleVerifyPayment = async (paymentId, isVerified, reason) => {
    await fetch(`/api/admin/gcash/${paymentId}/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        is_verified: isVerified,
        rejection_reason: reason,
      }),
    });
    
    fetchPendingPayments();
  };

  return (
    <div className="verification-page">
      <h2>GCash Payment Verification</h2>
      {pendingPayments.map((payment) => (
        <div key={payment.id} className="payment-card">
          <h3>Reference: {payment.reference_number}</h3>
          <p>Amount: PHP {payment.amount}</p>
          <img src={payment.payment_screenshot_path} alt="Payment Screenshot" />
          
          <button onClick={() => handleVerifyPayment(payment.id, true, null)}>
            Approve
          </button>
          <button onClick={() => handleVerifyPayment(payment.id, false, 'Invalid screenshot')}>
            Reject
          </button>
        </div>
      ))}
    </div>
  );
};
```

---

## 📦 Required Packages

```bash
composer require simplesoftwareio/simple-qrcode
```

---

## 🚀 Implementation Timeline

### Day 1: Database & Backend (4-5 hours)
- ✅ Create migration for GCash support
- ✅ Create GCashService
- ✅ Create GCashPaymentController
- ✅ Add routes
- ✅ Test backend endpoints

### Day 2: Frontend Integration (4-5 hours)
- ✅ Create GCashPayment component
- ✅ Create payment flow UI
- ✅ Create screenshot upload interface
- ✅ Create admin verification page
- ✅ Add status tracking

### Day 3: Testing & Polish (2-3 hours)
- ✅ Test end-to-end payment flow
- ✅ Test admin verification
- ✅ Handle edge cases
- ✅ Add notifications

**Total Estimated Time: 2-3 days**

---

## ✅ Summary

**Feasibility: VERY HIGH** ✅

GCash integration is **100% feasible** because:
1. ✅ No API key required (manual verification)
2. ✅ Can use existing payment infrastructure
3. ✅ Simple screenshot upload system
4. ✅ Admin verification workflow is straightforward
5. ✅ QR code generation is easy with libraries

This approach is actually **simpler** than PayPal/PayMongo because:
- ❌ No webhooks needed
- ❌ No API integration required
- ✅ Direct admin control
- ✅ More flexibility for handling edge cases

**Ready to implement?** 🚀

