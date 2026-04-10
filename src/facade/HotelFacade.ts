import { RoomManager } from '../services/RoomManager';
import type { Room } from '../services/RoomManager';
import { AdditionalServices } from '../services/AdditionalServices';
import type { ExtraService } from '../services/AdditionalServices';
import type { Invoice } from '../services/BillingService';
import { apiRequest } from '../services/apiService';

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
 * NOW UPDATED: Orchestrates calls to the Spring Boot backend.
 */
export class HotelFacade {
  private roomManager: RoomManager;
  private additionalServices: AdditionalServices;

  constructor() {
    this.roomManager = new RoomManager();
    this.additionalServices = new AdditionalServices();
  }

  async fetchAvailableRooms(checkIn: Date, checkOut: Date): Promise<Room[]> {
    return this.roomManager.getAvailableRooms(checkIn, checkOut);
  }

  async fetchAvailableExtras(): Promise<ExtraService[]> {
    return this.additionalServices.getAvailableExtras();
  }

  async processReservation(request: ReservationRequest): Promise<ReservationResult> {
    try {
      // 1. Create the base reservation in the backend
      const reserva = await apiRequest<any>('/api/hotel/reservar', {
        method: 'POST',
        body: JSON.stringify({
          habitacionId: request.roomId,
          clienteNombre: request.customerName,
          clienteDocumento: 'DOC-' + Math.floor(Math.random() * 10000), // Random placeholder
          fechaInicio: request.checkIn.toISOString().split('T')[0],
          fechaFin: request.checkOut.toISOString().split('T')[0]
        })
      });

      const reservaId = reserva.id;

      // 2. Add extra services sequentially
      for (const extraId of request.selectedExtraIds) {
        await apiRequest(`/api/hotel/servicios/${reservaId}`, {
          method: 'POST',
          body: JSON.stringify({ tipoServicio: extraId })
        });
      }

      // 3. Perform Check-in to generate the Digital Key
      const reservaWithKey = await apiRequest<any>(`/api/hotel/checkin/${reservaId}`, {
        method: 'PUT'
      });

      // 4. Perform Check-out to generate the Final Invoice
      const backendFactura = await apiRequest<any>(`/api/hotel/checkout/${reservaId}`, {
        method: 'PUT'
      });

      // Map backend Factura to frontend Invoice
      const roomDetail = backendFactura.detalles.find((d: any) => d.descripcion.includes('Alojamiento'));
      const extrasDetails = backendFactura.detalles.filter((d: any) => d.descripcion.includes('Servicio'));
      
      const roomTotal = roomDetail ? roomDetail.monto : 0;
      const extrasTotal = extrasDetails.reduce((acc: number, d: any) => acc + d.monto, 0);
      const subtotal = roomTotal + extrasTotal;
      const taxes = subtotal * 0.16;
      const grandTotal = subtotal + taxes;

      const invoice: Invoice = {
        roomTotal,
        extrasTotal,
        taxes,
        grandTotal,
        seasonText: 'Dynamic Season'
      };

      // 5. Get the room details for the final result
      const room = await this.roomManager.getRoomById(request.roomId);

      return {
        success: true,
        invoice,
        digitalKey: reservaWithKey.llaveDigital,
        room
      };

    } catch (error: any) {
      console.error('Reservation Error:', error);
      return {
        success: false,
        error: error.message || 'Error processing reservation on the backend'
      };
    }
  }
}

