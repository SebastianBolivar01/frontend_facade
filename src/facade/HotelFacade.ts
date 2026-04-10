import { RoomManager } from '../services/RoomManager';
import type { Room } from '../services/RoomManager';
import { PricingEngine } from '../services/PricingEngine';
import { AdditionalServices } from '../services/AdditionalServices';
import type { ExtraService } from '../services/AdditionalServices';
import { BillingService } from '../services/BillingService';
import type { Invoice } from '../services/BillingService';
import { AccessControl } from '../services/AccessControl';

export interface ReservationRequest {
  customerName: string;
  checkIn: Date;
  checkOut: Date;
  roomId: string;
  selectedExtraIds: string[];
}

export interface ReservationResult {
  success: boolean;
  invoice?: Invoice;
  digitalKey?: string;
  room?: Room;
  error?: string;
}

/**
 * HotelFacade simplifies all the internal subsystems (services) interactions.
 * The UI layer only needs to talk to this class.
 */
export class HotelFacade {
  private roomManager: RoomManager;
  private pricingEngine: PricingEngine;
  private additionalServices: AdditionalServices;
  private billingService: BillingService;
  private accessControl: AccessControl;

  constructor() {
    this.roomManager = new RoomManager();
    this.pricingEngine = new PricingEngine();
    this.additionalServices = new AdditionalServices();
    this.billingService = new BillingService();
    this.accessControl = new AccessControl();
  }

  // --- Simplified methods for UI components that only need partial data ---

  async fetchAvailableRooms(checkIn: Date, checkOut: Date): Promise<Room[]> {
    return this.roomManager.getAvailableRooms(checkIn, checkOut);
  }

  async fetchAvailableExtras(): Promise<ExtraService[]> {
    return this.additionalServices.getAvailableExtras();
  }

  // --- Complex transaction handled by Facade ---

  async processReservation(request: ReservationRequest): Promise<ReservationResult> {
    try {
      // 1. Calculate duration
      const durationMs = request.checkOut.getTime() - request.checkIn.getTime();
      const durationDays = Math.max(1, Math.ceil(durationMs / (1000 * 60 * 60 * 24)));

      // 2. Validate Room
      const room = await this.roomManager.getRoomById(request.roomId);
      if (!room) {
        throw new Error('Room not found or unavailable');
      }

      // 3. Dynamic Pricing Calculation
      const pricingData = await this.pricingEngine.calculateDynamicPrice(
        room.basePrice,
        request.checkIn,
        durationDays
      );

      // 4. Extras calculation
      const extrasTotal = await this.additionalServices.calculateExtrasCost(
        request.selectedExtraIds,
        durationDays
      );

      // 5. Final Billing
      const invoice = await this.billingService.generateBilling(
        pricingData.totalRoomPrice,
        extrasTotal,
        pricingData.season
      );

      // 6. Book room & generate digital key
      await this.roomManager.bookRoom(room.id);
      const digitalKey = await this.accessControl.generateDigitalKey(room.id, request.customerName);

      return {
        success: true,
        invoice,
        digitalKey,
        room
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message || 'Error processing reservation'
      };
    }
  }
}
