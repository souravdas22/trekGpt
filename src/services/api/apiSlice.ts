import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: 'https://api.trekgpt.example.com/' }), // Replace with actual API endpoint
  endpoints: (builder) => ({
    getWeather: builder.query<any, string>({
      query: (location) => `weather?location=${location}`,
    }),
  }),
});

export const { useGetWeatherQuery } = apiSlice;
