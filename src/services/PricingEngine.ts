export class PricingEngine {
  /**
   * Calculates the price considering the seasonality.
   * "Temporada Alta": June-August and December. Price is multiplied by 1.5.
   * "Temporada Baja": Other months. Base price.
   */
  async calculateDynamicPrice(basePrice: number, checkIn: Date, durationDays: number): Promise<{
    totalRoomPrice: number;
    season: 'Alta' | 'Baja';
    multiplier: number;
  }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const month = checkIn.getMonth(); // 0-indexed
        let isHighSeason = false;
        
        // High season logic
        if (month === 5 || month === 6 || month === 7 || month === 11) {
          isHighSeason = true;
        }

        const multiplier = isHighSeason ? 1.5 : 1.0;
        const season = isHighSeason ? 'Alta' : 'Baja';
        const totalRoomPrice = basePrice * multiplier * durationDays;

        resolve({
          totalRoomPrice,
          season,
          multiplier
        });
      }, 400);
    });
  }
}
