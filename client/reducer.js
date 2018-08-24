import {
  SET_FACEBOOK_STATUS,
  SET_FACEBOOK_INFO,
  SET_BEERS,
  SET_BARS,
  SET_BEER_TYPES,
} from './actions';

const initialAppState = {
  beers: [],
  bars: [],
  beerTypes: [],
  facebook: {
    status: '',
    name: '',
    id: '',
  },
};

export default function ebhReducer(state = initialAppState, action) {
  switch (action.type) {
    case SET_FACEBOOK_STATUS:
      return {
        ...state,
        facebook: {
          ...state.facebook,
          status: action.status,
        },
      };
    case SET_FACEBOOK_INFO:
      return {
        ...state,
        facebook: {
          ...state.facebook,
          name: action.name,
          id: action.id,
        },
      };
    case SET_BEERS:
      return {
        ...state,
        beers: action.beers,
      };
    case SET_BARS:
      return {
        ...state,
        bars: action.bars,
      };
    case SET_BEER_TYPES:
      return {
        ...state,
        beerTypes: action.types,
      };
    default:
      return state;
  }
}
