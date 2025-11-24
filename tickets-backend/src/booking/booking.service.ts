// src/booking/booking.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

export interface Booking {
  id: string;
  from?: string;
  to?: string;
  date?: string;
  price?: number;
  contact?: { email?: string; name?: string };
  status: string;
  providerBookingId: string; // id от Onelya или наша локальная onelya-...
  provider?: string;
  flightNumber?: string;
  departTime?: string;
  arriveTime?: string;
}

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);
  private bookings: Booking[] = [];

  // Onelya config from env
  private readonly baseUrl = process.env.ONELYA_BASE_URL || 'https://test.onelya.ru/api';
  private readonly login = process.env.ONELYA_LOGIN || 'trevel_manager';
  private readonly password = process.env.ONELYA_PASSWORD || 'Dy0Y(CWo';
  private readonly pos = process.env.ONELYA_POS || 'ВАШ_POS_ID';

  constructor(private readonly http: HttpService) {}

  // --- Local create (fallback) ---
  createLocal(body: any): Booking {
    const id = randomUUID();
    const booking: Booking = {
      id,
      from: body.from || 'Санкт-Петербург',
      to: body.to || 'Москва',
      date: body.date || new Date().toISOString().split('T')[0],
      price: body.price || 5600,
      contact: body.contact || {},
      providerBookingId: `onelya-${id}`,
      status: 'PENDING',
      provider: 'onelya-mock',
      flightNumber: body.flightNumber || 'SU 5411',
      departTime: body.departTime || '23:15',
      arriveTime: body.arriveTime || '23:55',
    };
    this.bookings.push(booking);
    return booking;
  }

  // --- Create reservation in Onelya (best-effort) ---
  async createOnelya(body: any) {
    // body expected from frontend: { flightId?, from, to, date, price, contact, flightNumber, departTime, arriveTime, segments }
    const url = `${this.baseUrl}/Order/V1/Reservation/Create`;
    const auth = 'Basic ' + Buffer.from(`${this.login}:${this.password}`).toString('base64');

    // Onelya expects a rather specific JSON structure. We will map minimal fields.
    // IMPORTANT: if Onelya requires additional fields (passengers, docs) — extend mapping.
    const payload = {
      // minimal: quantity info + segments - adapt later as needed
      Pos: this.pos,
      // The actual Onelya API may require different field names.
      // We send a minimal reservation structure — Onelya may return error if required fields are missing.
      Reservation: {
        // Example minimal fields — this may need tuning per Onelya contract
        Pricing: {
          Prices: [
            {
              PassengerType: 'Adult',
              Quantity: 1,
              Amount: body.price || 0,
            },
          ],
        },
        Segments: body.segments || [
          {
            OriginCode: body.from,
            DestinationCode: body.to,
            DepartureDate: `${body.date}T00:00:00`,
          },
        ],
        Contact: body.contact || {},
      },
    };

    try {
      const res = await firstValueFrom(
        this.http.post<any>(url, payload, {
          headers: {
            Authorization: auth,
            Pos: this.pos,
            'Content-Type': 'application/json',
            'Accept-Encoding': 'gzip',
          },
          timeout: 60000,
        }),
      );

      const data = res.data;
      // Onelya response shape may vary. We try to extract reservation id:
      const providerBookingId =
        data?.ReservationId || data?.Reservation?.Id || data?.Result?.ReservationId || data?.Id || randomUUID();

      // Save in our storage
      const id = randomUUID();
      const booking = {
        id,
        from: body.from,
        to: body.to,
        date: body.date,
        price: body.price,
        contact: body.contact,
        providerBookingId,
        status: 'CREATED', // tentative
        provider: 'onelya',
        flightNumber: body.flightNumber,
        departTime: body.departTime,
        arriveTime: body.arriveTime,
      } as Booking;

      this.bookings.push(booking);

      return { success: true, booking, raw: data };
    } catch (err) {
      this.logger.error('Onelya create error', err.response?.data || err.message);
      // fallback to local
      const booking = this.createLocal(body);
      return { success: false, booking, error: err.response?.data || err.message };
    }
  }

  // --- Confirm reservation in Onelya ---
  async confirmOnelya(providerBookingId: string) {
    const url = `${this.baseUrl}/Order/V1/Reservation/Confirm`;
    const auth = 'Basic ' + Buffer.from(`${this.login}:${this.password}`).toString('base64');

    const payload = { ReservationId: providerBookingId, Pos: this.pos };

    try {
      const res = await firstValueFrom(
        this.http.post<any>(url, payload, {
          headers: {
            Authorization: auth,
            Pos: this.pos,
            'Content-Type': 'application/json',
            'Accept-Encoding': 'gzip',
          },
          timeout: 60000,
        }),
      );
      const data = res.data;

      // update local booking status if we have it
      const booking = this.bookings.find((b) => b.providerBookingId === providerBookingId);
      if (booking) booking.status = 'CONFIRMED';

      return { success: true, raw: data };
    } catch (err) {
      this.logger.error('Onelya confirm error', err.response?.data || err.message);
      return { success: false, error: err.response?.data || err.message };
    }
  }

  // --- Get blank / ticket PDF or JSON ---
  // Try Avia/V1/Reservation/Blank or Order/V1/Reservation/Blank depending on provider
  async getBlank(providerBookingId: string) {
    const url1 = `${this.baseUrl}/Avia/V1/Reservation/Blank`;
    const url2 = `${this.baseUrl}/Order/V1/Reservation/Blank`;
    const auth = 'Basic ' + Buffer.from(`${this.login}:${this.password}`).toString('base64');

    const payload = { ReservationId: providerBookingId, Pos: this.pos };

    try {
      // try first endpoint
      let res = await firstValueFrom(
        this.http.post<any>(url1, payload, {
          headers: { Authorization: auth, Pos: this.pos, 'Content-Type': 'application/json' },
          responseType: 'arraybuffer', // pdf binary possible
          timeout: 60000,
        }),
      );

      // If response is json, return json; if pdf, return buffer
      if (res.headers && res.headers['content-type'] && res.headers['content-type'].includes('application/pdf')) {
        return { type: 'pdf', buffer: Buffer.from(res.data) };
      } else {
        return { type: 'json', data: res.data };
      }
    } catch (err1) {
      this.logger.warn('Blank via Avia failed, trying Order API', err1.message || err1);

      try {
        let res2 = await firstValueFrom(
          this.http.post<any>(url2, payload, {
            headers: { Authorization: auth, Pos: this.pos, 'Content-Type': 'application/json' },
            responseType: 'arraybuffer',
            timeout: 60000,
          }),
        );

        if (res2.headers && res2.headers['content-type'] && res2.headers['content-type'].includes('application/pdf')) {
          return { type: 'pdf', buffer: Buffer.from(res2.data) };
        } else {
          return { type: 'json', data: res2.data };
        }
      } catch (err2) {
        this.logger.error('Both blank endpoints failed', err2.response?.data || err2.message || err2);
        return { error: true, message: err2.response?.data || err2.message || 'Blank failed' };
      }
    }
  }

  // get booking by our internal id
  getById(id: string): Booking | undefined {
    return this.bookings.find((b) => b.id === id);
  }

  // find booking by provider id
  findByProviderId(providerId: string) {
    return this.bookings.find((b) => b.providerBookingId === providerId);
  }
}