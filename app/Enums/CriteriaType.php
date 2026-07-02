<?php

namespace App\Enums;

enum CriteriaType: string
{
    case Cost = 'cost';
    case Benefit = 'benefit';

    public function label(): string
    {
        return match ($this) {
            self::Cost => 'Cost',
            self::Benefit => 'Benefit',
        };
    }
}
