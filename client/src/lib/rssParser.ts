export async function validateRssFeed(url: string): Promise<boolean> {
  try {
    const response = await fetch(`/api/feeds/validate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url }),
    });
    return response.ok;
  } catch (error) {
    return false;
  }
}
