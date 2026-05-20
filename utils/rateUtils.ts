import { Price } from "./priceUtils";

export class Rate {
    private readonly basisPoints: number;

    private constructor(basisPoints: number) {
        this.basisPoints = Math.round(basisPoints);
    }

    static fromBasisPoints(basisPoints: number): Rate {
        return new Rate(basisPoints);
    }

    static fromPercentage(percentage: number): Rate {
        return new Rate(percentage * 100);
    }

    getBasisPoints(): number {
        return this.basisPoints;
    }

    toDecimal(): number {
        return this.basisPoints / 10000;
    }

    toDisplay(): string {
        return `${this.basisPoints / 100}%`;
    }

    applyTo(price: Price): Price {
        return Price.fromCents(
            Math.round((price.getCents() * this.basisPoints) / 10000),
        );
    }

    portionOf(total: Price): Price {
        const itemTotal = total.getCents() / (1 + this.toDecimal());
        return Price.fromCents(Math.round(total.getCents() - itemTotal));
    }

    discountFrom(price: Price): Price {
        return Price.fromCents(
            Math.round(
                price.getCents() -
                    (price.getCents() * this.basisPoints) / 10000,
            ),
        );
    }

    equals(other: Rate): boolean {
        return this.basisPoints === other.basisPoints;
    }
}
