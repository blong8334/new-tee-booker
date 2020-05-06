import { host, bookingPath } from '../constants';
import { buddies, partners } from '../sensitive';
import { request } from './utils';

export async function bookTime(bookingInfo: any, Cookie: string): Promise<object> {
  const { data: { bookingId, primaryPlayerId, reservations } } = bookingInfo;
  const Reservations = [{
    ReservationType: reservations[0].resType,
    FullName: reservations[0].fullName,
    MemberId: reservations[0].memberId,
    ReservationId: reservations[0].reservationId,
  }].concat(partners.map((name: string) => ({
    ReservationType: reservations[0].resType,
    FullName: name,
    MemberId: buddies[name],
    ReservationId: reservations[0].reservationId,
  })));
  const bookingBody = {
    BookingId: bookingId,
    Holes: 18,
    Mode: 'Booking',
    Notes: '',
    OwnerId: primaryPlayerId,
    Reservations,
    StartingHole: '1',
    enabled: true,
    wait: false,
  };
  const write = JSON.stringify(bookingBody);
  const reqOptions = {
    headers: {
      Cookie,
      'Content-Type': 'application/json',
      'Content-Length': write.length,
    },
    host,
    path: bookingPath,
    method: 'POST',
  };
  const { results } = await request(reqOptions, { write });
  return JSON.parse(results);
}