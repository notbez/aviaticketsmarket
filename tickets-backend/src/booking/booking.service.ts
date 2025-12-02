// tickets-backend/src/booking/booking.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { randomUUID } from 'crypto';
import { Booking, BookingDocument } from '../schemas/booking.schema';
import { OnelyaService } from '../onelya/onelya.service';
import { ReservationCreateRequest } from '../onelya/dto/order-reservation.dto';

export type CreateResult =
  | { success: true; booking: BookingDocument; raw?: any }
  | { success: false; booking: BookingDocument; error?: any; raw?: any };

@Injectable()
export class BookingService {
  private readonly logger = new Logger(BookingService.name);

  constructor(
    @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
    private readonly onelyaService: OnelyaService,
  ) {}

  /**
   * Создание локального бронирования (fallback)
   * 
   * Используется когда Onelya API недоступен или возвращает ошибку
   * Создает бронирование в MongoDB с тестовыми данными
   * 
   * @param userId - ID пользователя из JWT токена
   * @param body - Данные бронирования (from, to, date, price и т.д.)
   * @returns Созданное бронирование в MongoDB
   */
  public async createLocal(userId: string, body: any): Promise<BookingDocument> {
    const booking = new this.bookingModel({
      user: new Types.ObjectId(userId),
      from: body.from || 'Санкт-Петербург',
      to: body.to || 'Москва',
      departureDate: body.date ? new Date(body.date) : new Date(),
      returnDate: body.returnDate ? new Date(body.returnDate) : null,
      isRoundTrip: body.isRoundTrip || false,
      flightNumber: body.flightNumber || 'SU 5411',
      departTime: body.departTime || '23:15',
      arriveTime: body.arriveTime || '23:55',
      returnDepartTime: body.returnDepartTime,
      returnArriveTime: body.returnArriveTime,
      passengers: body.passengers || [],
      providerBookingId: `onelya-${randomUUID()}`,
      bookingStatus: 'reserved',
      provider: 'onelya-mock',
      payment: {
        paymentStatus: 'pending',
        amount: body.price || 5600,
        currency: 'RUB',
      },
      seat: body.seat || '12A',
      gate: body.gate || 'B5',
      boardingTime: body.boardingTime || '08:45',
    });
    await booking.save();
    this.logger.log(`Created local booking ${booking._id}`);
    return booking;
  }

  /**
   * Публичный метод создания бронирования (используется контроллером)
   * 
   * Пытается создать бронирование через Onelya API
   * При ошибке автоматически переключается на локальное создание
   * 
   * @param userId - ID пользователя из JWT токена
   * @param body - Данные бронирования
   * @returns Результат создания с флагом success и данными бронирования
   */
  public async create(userId: string, body: any): Promise<CreateResult> {
    // Основной путь — попытаться создать в Onelya, в случае ошибки — fallback на локальный
    return this.createOnelya(userId, body);
  }

  /**
   * Создание бронирования через Onelya API
   * 
   * Отправляет запрос к Onelya API для создания резервации
   * При успехе сохраняет бронирование в MongoDB
   * При ошибке возвращает результат с success: false и создает локальное бронирование
   * 
   * @param userId - ID пользователя
   * @param body - Данные бронирования (from, to, date, passengers и т.д.)
   * @returns Результат создания с данными бронирования и raw ответом от API
   */
  public async createOnelya(userId: string, body: any): Promise<CreateResult> {
    const reservationRequest: ReservationCreateRequest | undefined =
      body?.onelyaReservation || body?.reservationRequest;

    if (
      !reservationRequest ||
      !Array.isArray(reservationRequest.ReservationItems) ||
      !Array.isArray(reservationRequest.Customers)
    ) {
      this.logger.warn(
        '[Onelya] Missing reservation request payload, falling back to local booking',
      );
      const booking = await this.createLocal(userId, body);
      return {
        success: false,
        booking,
        error:
          'Reservation request payload (onelyaReservation) is required for Onelya booking',
      };
    }

    this.logger.log('[Onelya] Reservation/Create request');
    this.logger.debug(
      `[Onelya] Reservation/Create payload keys: ${Object.keys(
        reservationRequest,
      ).join(', ')}`,
    );

    try {
      const data = await this.onelyaService.createReservation(
        reservationRequest,
      );
      const providerBookingId = data?.OrderId
        ? String(data.OrderId)
        : randomUUID();

      // Сохраняем в MongoDB
      const bookingPayload = body?.localBooking ?? body;
      const booking = new this.bookingModel({
        user: new Types.ObjectId(userId),
        from: bookingPayload.from,
        to: bookingPayload.to,
        departureDate: bookingPayload.date
          ? new Date(bookingPayload.date)
          : new Date(),
        returnDate: bookingPayload.returnDate
          ? new Date(bookingPayload.returnDate)
          : null,
        isRoundTrip: bookingPayload.isRoundTrip || false,
        flightNumber: bookingPayload.flightNumber,
        departTime: bookingPayload.departTime,
        arriveTime: bookingPayload.arriveTime,
        returnDepartTime: bookingPayload.returnDepartTime,
        returnArriveTime: bookingPayload.returnArriveTime,
        passengers: bookingPayload.passengers || [],
        providerBookingId,
        bookingStatus: 'reserved',
        provider: 'onelya',
        payment: {
          paymentStatus: 'pending',
          amount: bookingPayload.price || data?.Amount || 0,
          currency: 'RUB',
        },
        seat: bookingPayload.seat || '12A',
        gate: bookingPayload.gate || 'B5',
        boardingTime: bookingPayload.boardingTime || '08:45',
        rawProviderData: data,
      });

      await booking.save();
      this.logger.log(
        `Created onelya booking ${providerBookingId} (local ${booking._id})`,
      );

      return { success: true, booking, raw: data };
    } catch (err: any) {
      const errorMessage = err?.message || String(err);
      this.logger.error(`[Onelya] Reservation create failed: ${errorMessage}`);
      // fallback to local
      const booking = await this.createLocal(userId, body);
      return {
        success: false,
        booking,
        error: errorMessage,
        raw: err,
      };
    }
  }

  // --- Confirm reservation in Onelya ---
  public async confirmOnelya(providerBookingId: string) {
    this.logger.warn(
      `[Onelya] Reservation/Confirm is not implemented yet (waiting for documentation). ReservationId=${providerBookingId}`,
    );
    return {
      success: false,
      error: 'Reservation/Confirm not implemented yet. Awaiting documentation.',
    };
  }

  // --- Get blank / ticket PDF or JSON ---
  public async getBlank(providerBookingId: string) {
    this.logger.warn(
      `[Onelya] Reservation/Blank is not implemented yet (waiting for documentation). ReservationId=${providerBookingId}`,
    );
    return {
      error: true,
      message: 'Reservation/Blank not implemented yet. Awaiting documentation.',
    };
  }

  // get booking by our internal id
  public async getById(id: string): Promise<BookingDocument | null> {
    if (!Types.ObjectId.isValid(id)) {
      return null;
    }
    return this.bookingModel.findById(id);
  }

  // find booking by provider id
  public async findByProviderId(providerId: string): Promise<BookingDocument | null> {
    return this.bookingModel.findOne({ providerBookingId: providerId });
  }

  // get all bookings for a user
  public async getUserBookings(userId: string): Promise<BookingDocument[]> {
    return this.bookingModel
      .find({ user: new Types.ObjectId(userId) })
      .sort({ createdAt: -1 })
      .exec();
  }
}