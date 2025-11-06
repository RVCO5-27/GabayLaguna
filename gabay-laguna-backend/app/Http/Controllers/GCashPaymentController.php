<?php

namespace App\Http\Controllers;

use App\Services\GCashService;
use App\Models\Payment;
use App\Models\Booking;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

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

        try {
            $booking = Booking::findOrFail($request->booking_id);
            
            $result = $this->gcashService->createGCashPayment($booking);

            if ($result['success']) {
                return response()->json($result, 200);
            }

            return response()->json($result, 400);

        } catch (\Exception $e) {
            Log::error('GCash payment initiation error', [
                'error' => $e->getMessage(),
                'request' => $request->all()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to initiate GCash payment'
            ], 500);
        }
    }

    /**
     * Upload payment screenshot
     */
    public function uploadScreenshot(Request $request, $paymentId)
    {
        $request->validate([
            'screenshot' => 'required|file|mimes:jpeg,png,jpg,pdf|max:5120',
        ]);

        try {
            $payment = Payment::findOrFail($paymentId);
            
            if ($payment->payment_method !== 'gcash') {
                return response()->json([
                    'success' => false,
                    'error' => 'This is not a GCash payment'
                ], 400);
            }

            $result = $this->gcashService->uploadPaymentScreenshot(
                $payment,
                $request->file('screenshot')
            );

            return response()->json($result);

        } catch (\Exception $e) {
            Log::error('GCash screenshot upload error', [
                'payment_id' => $paymentId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to upload screenshot'
            ], 500);
        }
    }

    /**
     * Get payment status
     */
    public function getPaymentStatus($paymentId)
    {
        try {
            $payment = Payment::findOrFail($paymentId);
            
            $status = $this->gcashService->getPaymentStatus($payment);

            return response()->json($status);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'error' => 'Failed to get payment status'
            ], 500);
        }
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

        try {
            $payment = Payment::findOrFail($paymentId);
            
            if ($payment->payment_method !== 'gcash') {
                return response()->json([
                    'success' => false,
                    'error' => 'This is not a GCash payment'
                ], 400);
            }

            $result = $this->gcashService->verifyPayment(
                $payment,
                $request->is_verified,
                auth()->id(),
                $request->rejection_reason ?? null
            );

            return response()->json($result);

        } catch (\Exception $e) {
            Log::error('GCash payment verification error', [
                'payment_id' => $paymentId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to verify payment'
            ], 500);
        }
    }

    /**
     * Admin: Get pending payments for verification
     */
    public function getPendingVerifications()
    {
        try {
            $payments = Payment::where('payment_method', 'gcash')
                ->where('verification_status', 'pending')
                ->with(['booking.tourist', 'booking.tourGuide', 'booking.pointOfInterest'])
                ->orderBy('created_at', 'desc')
                ->paginate(20);

            return response()->json($payments);

        } catch (\Exception $e) {
            Log::error('Failed to fetch pending verifications', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'error' => 'Failed to fetch pending verifications'
            ], 500);
        }
    }
}

