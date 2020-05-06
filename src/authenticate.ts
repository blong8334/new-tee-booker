function getCookies() {
  // check the cache. if cookie is expired, get new one. 
  // check cache. check expiration. if cookie is still valid, return it.
  // otherwise get new cookie and write to cache. then return it.
  let cache = fs.readFileSync(cachePath, { encoding: 'utf8' });
  if (typeof cache === 'string') {
    cache = JSON.parse(cache);
  }
  const expireDate = new Date(cache.Cookie.expires);
  const currentTime = new Date();
  if (currentTime.valueOf() < expireDate.valueOf()) {
    return Object.keys(cache.Cookie).reduce((results, key) => {
      results += key;
      const value = cache.Cookie[key];
      if (value) {
        results += `=${value}`;
      }
      return results + '; ';
    }, '').slice(0, -2);
  }
}

function checkIsExpired() {
  
}

module.exports = {
  getCookies,
};