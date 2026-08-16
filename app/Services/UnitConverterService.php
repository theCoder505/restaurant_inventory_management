<?php

namespace App\Services;

class UnitConverterService
{
    /**
     * Converts a quantity from one unit to another compatible base unit.
     */
    public static function convert(float $quantity, string $fromUnit, string $toUnit): float
    {
        $fromUnit = strtolower(trim($fromUnit));
        $toUnit = strtolower(trim($toUnit));

        if ($fromUnit === $toUnit) {
            return $quantity;
        }

        // Weight Conversions (base: g)
        $weightUnits = [
            'kg' => 1000,
            'kilogram' => 1000,
            'g' => 1,
            'gram' => 1,
            'mg' => 0.001,
        ];

        // Volume Conversions (base: ml)
        $volumeUnits = [
            'l' => 1000,
            'liter' => 1000,
            'litre' => 1000,
            'ml' => 1,
            'milliliter' => 1,
        ];

        // Count Conversions (base: piece)
        $countUnits = [
            'dozen' => 12,
            'piece' => 1,
            'pc' => 1,
            'pack' => 1,
            'box' => 1,
            'unit' => 1,
        ];

        if (isset($weightUnits[$fromUnit]) && isset($weightUnits[$toUnit])) {
            $inGrams = $quantity * $weightUnits[$fromUnit];
            return $inGrams / $weightUnits[$toUnit];
        }

        if (isset($volumeUnits[$fromUnit]) && isset($volumeUnits[$toUnit])) {
            $inMl = $quantity * $volumeUnits[$fromUnit];
            return $inMl / $volumeUnits[$toUnit];
        }

        if (isset($countUnits[$fromUnit]) && isset($countUnits[$toUnit])) {
            $inPieces = $quantity * $countUnits[$fromUnit];
            return $inPieces / $countUnits[$toUnit];
        }

        // Fallback: Return original quantity if incompatible units
        return $quantity;
    }
}
