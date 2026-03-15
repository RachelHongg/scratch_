export function getSearchParams(): { q: string; sort: string | null } {
  const params = new URLSearchParams(window.location.search);
  return {
    q: params.get('q') || '',
    sort: params.get('sort'),
  };
}

export function setSearchParams(params: Record<string, string | null>) {
  const url = new URL(window.location.href);
  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    } else {
      url.searchParams.delete(key);
    }
  });
  history.replaceState(null, '', url.toString());
}
