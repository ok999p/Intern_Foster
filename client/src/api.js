const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

async function handle(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

export function getCategories() {
  return fetch(`${BASE_URL}/categories`).then(handle);
}

export function getProducts() {
  return fetch(`${BASE_URL}/products`).then(handle);
}

export function createProduct(product) {
  return fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  }).then(handle);
}

export function updateProduct(id, product) {
  return fetch(`${BASE_URL}/products/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  }).then(handle);
}

export function deleteProduct(id) {
  return fetch(`${BASE_URL}/products/${id}`, {
    method: 'DELETE',
  }).then(handle);
}
