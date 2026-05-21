import { Rate } from "./rateUtils";

export function toServiceChargeRate(
    serviceValue: number,
    totalCents: number,
    serviceType: "percentage" | "amount",
): Rate {
    if (serviceType === "percentage") {
        return Rate.fromPercentage(serviceValue);
    }

    if (serviceValue === 0 || totalCents === 0) {
        return Rate.fromBasisPoints(0);
    }

    const itemsCents = totalCents - serviceValue * 100;
    const percentage = ((serviceValue * 100) / itemsCents) * 100;
    return Rate.fromPercentage(percentage);
}
