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
        $this->gcashConfig = GCashConfiguration::getActive();
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
            $qrData = $this->generateQRCodeData(
                $gcashAccount->account_number,
                $booking->total_amount,
                $referenceNumber
            );
            
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

            // Generate QR code image (optional - if you have the library)
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
                'amount' => $booking->total_amount,
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
    protected function generateQRCodeData(string $accountNumber, float $amount, string $referenceNumber): array
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
     * Generate QR code image (requires simplesoftwareio/simple-qrcode package)
     */
    protected function generateQRCodeImage(string $qrData, string $referenceNumber): ?string
    {
        try {
            if (class_exists('\SimpleSoftwareIO\QrCode\Facades\QrCode')) {
                $qrCode = \SimpleSoftwareIO\QrCode\Facades\QrCode::format('png')
                    ->size(300)
                    ->generate($qrData);

                $fileName = "gcash-qr-{$referenceNumber}.png";
                $filePath = "gcash-qr-codes/{$fileName}";
                
                Storage::put($filePath, $qrCode);
                return $filePath;
            }
        } catch (\Exception $e) {
            Log::error('QR Code generation failed', ['error' => $e->getMessage()]);
        }

        return null;
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
            'Open your GCash app',
            'Tap "Scan QR Code" or go to "Send Money"',
            'Scan the QR code or enter the account number manually',
            'Enter the exact amount shown',
            'Add the reference number in the message/notes field',
            'Complete the payment',
            'Take a screenshot of the payment confirmation',
            'Upload the screenshot on this page',
            'Wait for admin verification (usually within 24 hours)',
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

            // Check file type
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

                // Update booking payment status
                $payment->booking->update([
                    'payment_status' => 'fully_paid',
                    'status' => 'confirmed',
                    'paid_at' => now(),
                ]);

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
        // TODO: Implement notification system
        // Send email or push notification to admin users
    }

    /**
     * Notify user of payment confirmation
     */
    protected function notifyUserOfPaymentConfirmation(Payment $payment): void
    {
        // TODO: Implement notification system
        // Send email or SMS notification to tourist
    }

    /**
     * Notify user of payment rejection
     */
    protected function notifyUserOfPaymentRejection(Payment $payment, string $reason): void
    {
        // TODO: Implement notification system
        // Send notification to tourist about rejection
    }
}

