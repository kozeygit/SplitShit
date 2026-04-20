/**
 * Price class for handling monetary values stored as integers (cents).
 * Ensures type safety and prevents floating-point errors.
 */
export class Price {
  private readonly cents: number;

  // Private constructor - use factory methods instead
  private constructor(cents: number) {
    this.cents = Math.round(cents);
  }

  /**
   * Create a Price from cents (e.g., 1250 for £12.50)
   */
  static fromCents(cents: number): Price {
    return new Price(cents);
  }

  /**
   * Create a Price from a decimal value (e.g., 12.50)
   */
  static fromDecimal(decimal: number | string): Price {
    const num = typeof decimal === "string" ? parseFloat(decimal) : decimal;
    return new Price(Math.round(num * 100));
  }

  /**
   * Get the price in cents
   */
  getCents(): number {
    return this.cents;
  }

  /**
   * Get the price as a decimal number
   */
  toDecimal(): number {
    return this.cents / 100;
  }

  /**
   * Get the price formatted for display (e.g., "12.50")
   */
  toDisplay(): string {
    return (this.cents / 100).toFixed(2);
  }

  /**
   * Get the price with currency symbol (e.g., "£12.50")
   */
  toString(): string {
    return `£${this.toDisplay()}`;
  }

  // Arithmetic operations

  /**
   * Add another price to this one
   */
  add(other: Price): Price {
    return new Price(this.cents + other.cents);
  }

  /**
   * Subtract another price from this one
   */
  subtract(other: Price): Price {
    return new Price(this.cents - other.cents);
  }

  /**
   * Multiply this price by a factor
   */
  multiply(factor: number): Price {
    return new Price(this.cents * factor);
  }

  /**
   * Divide this price by a divisor
   */
  divide(divisor: number): Price {
    return new Price(this.cents / divisor);
  }

  /**
   * Divide this price evenly among N people, rounding to nearest cent
   */
  divideEvenly(people: number): Price {
    if (people <= 0) return new Price(0);
    return new Price(Math.round(this.cents / people));
  }

  /**
   * Calculate a percentage of this price
   */
  calculatePercentage(percentage: number): Price {
    return new Price(Math.round((this.cents * percentage) / 100));
  }

  // Comparisons

  /**
   * Check if this price equals another
   */
  equals(other: Price): boolean {
    return this.cents === other.cents;
  }

  /**
   * Check if this price is greater than another
   */
  isGreaterThan(other: Price): boolean {
    return this.cents > other.cents;
  }

  /**
   * Check if this price is less than another
   */
  isLessThan(other: Price): boolean {
    return this.cents < other.cents;
  }

  /**
   * Check if this price is greater than or equal to another
   */
  isGreaterThanOrEqual(other: Price): boolean {
    return this.cents >= other.cents;
  }

  /**
   * Check if this price is less than or equal to another
   */
  isLessThanOrEqual(other: Price): boolean {
    return this.cents <= other.cents;
  }
}
