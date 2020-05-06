module.exports = {
  courseId: '1361',
  year: '2020',
  month: '05',
  day: '09',
  host: 'newjerseynational.clubhouseonline-e3.com',
  loginPath: '/login.aspx',
  timesPath: (date, courseId) => `/api/v1/teetimes/GetAvailableTeeTimes/${date}/${courseId}/0/null/false`,
  proceedPath: (bookingId) => `/api/v1/teetimes/ProceedBooking/${bookingId}`,
  formUsername: 'p$lt$PageContent$pageplaceholder$p$lt$zoneLeft$CHOLogin$LoginControl$ctl00$Login1$UserName',
  formPassword: 'p$lt$PageContent$pageplaceholder$p$lt$zoneLeft$CHOLogin$LoginControl$ctl00$Login1$Password',
  formLogin: 'p$lt$PageContent$pageplaceholder$p$lt$zoneLeft$CHOLogin$LoginControl$ctl00$Login1$LoginButton',
  login: 'Log in',
};