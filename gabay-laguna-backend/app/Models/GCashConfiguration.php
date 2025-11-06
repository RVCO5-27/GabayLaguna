<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class GCashConfiguration extends Model
{
    use HasFactory;

    protected $table = 'gcash_configurations';

    protected $fillable = [
        'account_name',
        'account_number',
        'qrcode_image_path',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    /**
     * Get active GCash configuration
     */
    public static function getActive()
    {
        return self::where('is_active', true)->first();
    }

    /**
     * Scope to get only active configurations
     */
    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }
}

