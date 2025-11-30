// tickets-backend/src/booking/booking.service.ts
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
  providerBookingId: string;
  provider?: string;
  flightNumber?: string;
  departTime?: string;
  arriveTime?: string;
  seat?: string;
  gate?: string;
  boardingTime?: string;
}

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);
  private bookings: Booking[] = [];

  // Onelya config from env
  private readonly baseUrl =
    process.env.ONELYA_BASE_URL || 'https://test.onelya.ru/api';
  private readonly login = process.env.ONELYA_LOGIN || 'trevel_manager';
  private readonly password =
    process.env.ONELYA_PASSWORD || 'Dy0Y(CWo';
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
      seat: body.seat || '12A',
      gate: body.gate || 'B5',
      boardingTime: body.boardingTime || '08:45',
    };
    this.bookings.push(booking);
    this.logger.log(`Created local booking ${booking.id}`);
    return booking;
  }

  // --- Public create (used by controller) ---
  // Возвращает { success: boolean, booking, raw?, error? }
  async create(body: any) {
    return this.createOnelya(body);
  }

  // --- Create reservation in Onelya (best-effort) ---
  async createOnelya(body: any) {
    const url = `${this.baseUrl}/Order/V1/Reservation/Create`;
    const auth =
      'Basic ' + Buffer.from(`${this.login}:${this.password}`).toString('base64');

    const payload = {
      Pos: this.pos,
      Reservation: {
        Pricing: {
          Prices: [
            {
              PassengerType: 'Adult',
              Quantity: 1,
              Amount: body.price || 0,
            },
          ],
        },
        Segments:
          body.segments || [
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

      // Попытка извлечь ID брони из различных мест в ответе
      const providerBookingId =
        data?.ReservationId ||
        data?.Reservation?.Id ||
        data?.Result?.ReservationId ||
        data?.Id ||
        randomUUID();

      // Сохраняем в локальном сторе (с заполененными seat/gate/boardingTime при наличии)
      const id = randomUUID();
      const booking: Booking = {
        id,
        from: body.from,
        to: body.to,
        date: body.date,
        price: body.price,
        contact: body.contact,
        providerBookingId,
        status: 'CREATED',
        provider: 'onelya',
        flightNumber: body.flightNumber,
        departTime: body.departTime,
        arriveTime: body.arriveTime,
        seat: body.seat || '12A',
        gate: body.gate || 'B5',
        boardingTime: body.boardingTime || '08:45',
      };

      this.bookings.push(booking);
      this.logger.log(`Created onelya booking ${providerBookingId} (local ${id})`);

      return { success: true, booking, raw: data };
    } catch (err) {
      this.logger.error(
        'Onelya create error',
        err?.response?.data || err?.message || err,
      );
      // fallback to local
      const booking = this.createLocal(body);
      return {
        success: false,
        booking,
        error: err?.response?.data || err?.message || String(err),
      };
    }
  }

  // --- Confirm reservation in Onelya ---
  async confirmOnelya(providerBookingId: string) {
    const url = `${this.baseUrl}/Order/V1/Reservation/Confirm`;
    const auth =
      'Basic ' + Buffer.from(`${this.login}:${this.password}`).toString('base64');

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

      const booking = this.bookings.find(
        (b) => b.providerBookingId === providerBookingId,
      );
      if (booking) booking.status = 'CONFIRMED';

      return { success: true, raw: data };
    } catch (err) {
      this.logger.error(
        'Onelya confirm error',
        err?.response?.data || err?.message || err,
      );
      return { success: false, error: err?.response?.data || err?.message || String(err) };
    }
  }

  // --- Get blank / ticket PDF or JSON ---
  async getBlank(providerBookingId: string) {
    const url1 = `${this.baseUrl}/Avia/V1/Reservation/Blank`;
    const url2 = `${this.baseUrl}/Order/V1/Reservation/Blank`;
    const auth =
      'Basic ' + Buffer.from(`${this.login}:${this.password}`).toString('base64');

    const payload = { ReservationId: providerBookingId, Pos: this.pos };

    try {
      let res = await firstValueFrom(
        this.http.post<any>(url1, payload, {
          headers: { Authorization: auth, Pos: this.pos, 'Content-Type': 'application/json' },
          responseType: 'arraybuffer',
          timeout: 60000,
        }),
      );

      if (res.headers && res.headers['content-type'] && res.headers['content-type'].includes('application/pdf')) {
        return { type: 'pdf', buffer: Buffer.from(res.data) };
      } else {
        return { type: 'json', data: res.data };
      }
    } catch (err1) {
      this.logger.warn('Blank via Avia failed, trying Order API', String(err1));
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
        this.logger.error('Both blank endpoints failed', err2?.response?.data || err2?.message || err2);
        return { error: true, message: err2?.response?.data || err2?.message || 'Blank failed' };
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