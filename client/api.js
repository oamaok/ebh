import * as R from 'ramda';

export function apiCall(path, options = {}) {
  return fetch(`/api/${path}`, R.mergeAll([
    { method: 'GET' },
    options,
    {
      headers: {
        'content-type': 'application/json;charset=UTF-8',
      },
    },
  ])).then(res => res.json());
}

export async function addBeer({
  type, volume, abv, price, bar, token, description,
}) {
  return apiCall('beer', {
    method: 'POST',
    body: JSON.stringify({
      beerType: parseInt(type),
      volume,
      abv: isNaN(parseFloat(abv)) ? 0 : parseFloat(abv),
      price: isNaN(parseFloat(price)) ? 0 : parseFloat(price),
      token,
      bar: parseInt(bar),
      description,
    }),
  });
}

export function updateBeerReview({
  beerId, starRating, review,
}) {
  return apiCall('review', {
    method: 'POST',
    body: JSON.stringify({
      beerId, starRating, review,
    }),
  });
}

export async function deleteBeer({
  beerId, token,
}) {
  await apiCall('delete', {
    method: 'POST',
    body: JSON.stringify({
      beerId,
      token,
    }),
  });
}
