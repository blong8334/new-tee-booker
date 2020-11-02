module.exports = {
  courseId: '1440',
  host: 'newjerseynational.clubhouseonline-e3.com',
  loginPath: '/login.aspx',
  formUsername: 'p$lt$PageContent$pageplaceholder$p$lt$zoneLeft$CHOLogin$LoginControl$ctl00$Login1$UserName',
  formPassword: 'p$lt$PageContent$pageplaceholder$p$lt$zoneLeft$CHOLogin$LoginControl$ctl00$Login1$Password',
  formLogin: 'p$lt$PageContent$pageplaceholder$p$lt$zoneLeft$CHOLogin$LoginControl$ctl00$Login1$LoginButton',
  login: 'Log in',
  getTimesPath: (date, courseId) => `/api/v1/teetimes/GetAvailableTeeTimes/${date}/${courseId}/0/null/false`,
  proceedPath: (bookingId) => `/api/v1/teetimes/ProceedBooking/${bookingId}`,
  bookingPath: '/api/v1/teetimes/CommitBooking/0',
  noTimesErrorMessage: 'No times left for the target booking day',
  retryMessages: [
    'The tee time you have selected is fully booked',
    'A booking restriction is preventing you from',
    'Online Tee Times is currently unavailable',
  ],
};