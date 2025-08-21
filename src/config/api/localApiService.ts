const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const localApi = {
  get: async (
    endpoint: string,
    queryParams: { [key: string]: string } = {}
  ) => {
    let url = `${BASE_URL}/${endpoint}`;
    if (Object.keys(queryParams).length > 0) {
      const queryString = new URLSearchParams(queryParams).toString();
      url += `?${queryString}`;
    }
    const response = await fetch(url);
    return response.json();
  },
  post: async (endpoint: string, data: any) => {
    const response = await fetch(`${BASE_URL}/${endpoint}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  put: async (endpoint: string, id: string, data: any) => {
    const response = await fetch(`${BASE_URL}/${endpoint}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  delete: async (endpoint: string, id: string) => {
    const response = await fetch(`${BASE_URL}/${endpoint}/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};
