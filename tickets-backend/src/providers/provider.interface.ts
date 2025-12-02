export interface ProviderInterface {
      search(params: any): Promise<any>;
      createReservation(data: any): Promise<any>;
      confirmPayment(providerBookingId: string, paymentInfo: any): Promise<any>;
      getPdf(providerBookingId: string): Promise<Buffer | string>;
    }